import type { Prisma } from '@prisma/client';
import { type Actions, error, redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import {
  bulkProjectActionSchema,
  canModifyProject,
  projectSearchSchema,
  pruneProjects
} from '$lib/projects';
import { doProjectAction, projectFilter, userGroupsForOrg } from '$lib/projects/server';
import { QueueConnected } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';
import { stringIdSchema } from '$lib/valibot';

const bulkProductActionSchema = v.object({
  products: v.array(stringIdSchema),
  operation: v.nullable(v.pipe(v.enum(ProductActionType), v.excludes(ProductActionType.Cancel)))
});

function whereStatements(
  filter: string,
  orgId: number,
  userId?: number
): Prisma.ProjectsWhereInput {
  const selector = filter as 'organization' | 'active' | 'archived' | 'all' | 'own';
  switch (selector) {
    case 'organization':
      return {
        OrganizationId: orgId,
        DateArchived: null
      };
    case 'active':
      return {
        OrganizationId: orgId,
        DateActive: {
          not: null
        },
        DateArchived: null
      };
    case 'archived':
      return {
        OrganizationId: orgId,
        DateArchived: {
          not: null
        }
      };
    case 'all':
      return {
        OrganizationId: orgId
      };
    case 'own':
      return {
        OrganizationId: orgId,
        OwnerId: userId,
        DateArchived: null
      };
  }
}

export const load = (async ({ params, locals }) => {
  const userId = (await locals.auth())?.user.userId;
  const orgId = parseInt(params.id);
  if (
    isNaN(orgId) ||
    !(orgId + '' === params.id) ||
    !(await DatabaseReads.organizations.findFirst({ where: { Id: orgId } }))
  ) {
    return redirect(302, localizeHref(`/projects/${params.filter}`));
  }

  const projects = await DatabaseReads.projects.findMany({
    where: whereStatements(params.filter, orgId, userId),
    include: {
      Products: {
        include: {
          ProductDefinition: true,
          WorkflowInstance: true
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    },
    take: 10
  });
  return {
    projects: pruneProjects(projects),
    pageForm: await superValidate(
      {
        page: {
          page: 0,
          size: 10
        }
      },
      valibot(projectSearchSchema)
    ),
    count: await DatabaseReads.projects.count({
      where: whereStatements(params.filter, orgId, userId)
    }),
    actionForm: await superValidate(valibot(bulkProjectActionSchema)),
    productForm: await superValidate(valibot(bulkProductActionSchema)),
    productDefinitions: await DatabaseReads.productDefinitions.findMany(),
    /** allow actions other than reactivation */
    allowActions: params.filter !== 'archived',
    allowReactivate: params.filter === 'all' || params.filter === 'archived',
    userGroups: (await userGroupsForOrg(userId!, orgId)).map((g) => g.GroupId),
    jobsAvailable: QueueConnected()
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ params, request, locals }) {
    const user = (await locals.auth())!.user;

    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const organizationId = parseInt(params.id!);

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter({ ...form.data, organizationId }),
      ...whereStatements(params.filter!, organizationId, user.userId)
    };

    const projects = await DatabaseReads.projects.findMany({
      where,
      include: {
        Products: {
          include: {
            ProductDefinition: true,
            WorkflowInstance: true
          }
        },
        Owner: true,
        Group: true,
        Organization: true
      },
      skip: form.data.page.size * form.data.page.page,
      take: form.data.page.size
    });

    const count = await DatabaseReads.projects.count({ where: where });

    return { form, ok: true, query: { data: pruneProjects(projects), count } };
  },
  projectAction: async (event) => {
    const session = await event.locals.auth();
    if (!session) return fail(403);
    const orgId = parseInt(event.params.id!);
    if (
      isNaN(orgId) ||
      !(orgId + '' === event.params.id) ||
      !(await DatabaseReads.organizations.findFirst({ where: { Id: orgId } }))
    ) {
      return fail(404);
    }

    if (!QueueConnected()) return error(503);

    const form = await superValidate(event.request, valibot(bulkProjectActionSchema));
    if (
      !form.valid ||
      !form.data.operation ||
      (!form.data.projects?.length && form.data.projectId === null)
    ) {
      return fail(400, { form, ok: false });
    }
    // prefer single project over array
    const projects = await DatabaseReads.projects.findMany({
      where: {
        Id: { in: form.data.projectId !== null ? [form.data.projectId] : form.data.projects }
      },
      select: {
        Id: true,
        DateArchived: true,
        OwnerId: true,
        GroupId: true
      }
    });
    if (!projects.every((p) => canModifyProject(session, p.OwnerId, orgId))) {
      return fail(403);
    }

    const groups =
      form.data.operation === 'claim'
        ? (await userGroupsForOrg(session.user.userId, orgId)).map((g) => g.GroupId)
        : [];
    await Promise.all(
      projects.map(async (project) => {
        await doProjectAction(form.data.operation, project, session, orgId, groups);
      })
    );

    return { form, ok: true };
  },
  productAction: async (event) => {
    const session = await event.locals.auth();
    const orgId = parseInt(event.params.id!);
    if (isNaN(orgId) || !(orgId + '' === event.params.id)) return fail(404);

    if (!QueueConnected()) return error(503);

    const form = await superValidate(event.request, valibot(bulkProductActionSchema));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    // if any productId doesn't exist, 403
    // if any associated project is inaccessible, 403
    // if user modified hidden values
    if (
      !(
        (await DatabaseReads.products.count({ where: { Id: { in: form.data.products } } })) ===
          form.data.products.length &&
        (
          await DatabaseReads.projects.findMany({
            where: {
              Products: {
                some: {
                  Id: { in: form.data.products }
                }
              }
            },
            select: {
              OwnerId: true
            }
          })
        ).every((p) => canModifyProject(session, p.OwnerId, orgId))
      )
    ) {
      return fail(403);
    }

    await Promise.all(form.data.products.map((p) => doProductAction(p, form.data.operation!)));

    return { form, ok: true };
  }
};
