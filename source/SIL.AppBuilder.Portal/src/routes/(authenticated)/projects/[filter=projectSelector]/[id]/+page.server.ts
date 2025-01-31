import {
  bulkProjectActionSchema,
  canModifyProject,
  projectSearchSchema,
  pruneProjects
} from '$lib/projects/common';
import { doProjectAction, projectFilter, userGroupsForOrg } from '$lib/projects/common.server';
import type { Prisma } from '@prisma/client';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';

const bulkProductActionSchema = v.object({
  products: v.array(v.pipe(v.string(), v.uuid())),
  operation: v.nullable(v.picklist(['rebuild', 'republish']))
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

export const load = (async ({ params, url, locals }) => {
  const userId = (await locals.auth())?.user.userId;
  const orgId = parseInt(params.id);
  if (isNaN(orgId) || !(orgId + '' === params.id)) {
    const paths = url.pathname.split('/');
    return redirect(302, paths.slice(0, paths.length - 1).join('/'));
  }
  const projects = await prisma.projects.findMany({
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
        },
        organizationId: orgId
      },
      valibot(projectSearchSchema)
    ),
    count: await prisma.projects.count({ where: whereStatements(params.filter, orgId, userId) }),
    actionForm: await superValidate(valibot(bulkProjectActionSchema)),
    productForm: await superValidate(valibot(bulkProductActionSchema)),
    productDefinitions: await prisma.productDefinitions.findMany(),
    /** allow actions other than reactivation */
    allowActions: params.filter !== 'archived',
    allowReactivate: params.filter === 'all' || params.filter === 'archived',
    userGroups: (await userGroupsForOrg(userId!, orgId)).map((g) => g.GroupId)
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ params, request, locals }) {
    const userId = (await locals.auth())?.user.userId;
    if (!userId) return error(400);

    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter(form.data),
      ...whereStatements(params.filter!, parseInt(params.id!), userId)
    };

    const projects = await prisma.projects.findMany({
      where: where,
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

    const count = await prisma.projects.count({ where: where });

    return { form, ok: true, query: { data: pruneProjects(projects), count } };
  },
  projectAction: async (event) => {
    const session = await event.locals.auth();
    if (!session) return fail(403);
    const orgId = parseInt(event.params.id!);
    if (isNaN(orgId) || !(orgId + '' === event.params.id)) return fail(404);

    const form = await superValidate(event.request, valibot(bulkProjectActionSchema));
    if (
      !form.valid ||
      !form.data.operation ||
      (!form.data.projects?.length && form.data.projectId === null)
    )
      return fail(400, { form, ok: false });
    // prefer single project over array
    const projects = await prisma.projects.findMany({
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
    if (!session) return fail(403);
    const orgId = parseInt(event.params.id!);
    if (isNaN(orgId) || !(orgId + '' === event.params.id)) return fail(404);

    const form = await superValidate(event.request, valibot(bulkProductActionSchema));
    console.log(JSON.stringify(form, null, 4));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });

    return { form, ok: true };
  }
};
