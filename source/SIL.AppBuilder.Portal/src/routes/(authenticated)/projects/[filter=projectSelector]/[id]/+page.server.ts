import { canModifyProject, projectSearchSchema, pruneProjects } from '$lib/projects/common';
import { projectFilter } from '$lib/projects/common.server';
import { idSchema } from '$lib/valibot';
import type { Prisma } from '@prisma/client';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';

const bulkProjectOperationSchema = v.object({
  operation: v.nullable(v.picklist(['archive', 'reactivate'])),
  projects: v.array(v.object({ Id: idSchema, OwnerId: idSchema, Archived: v.boolean() }))
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
          ProductDefinition: true
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
    productDefinitions: await prisma.productDefinitions.findMany(),
    actionForm: await superValidate(valibot(bulkProjectOperationSchema)),
    allowArchive: params.filter !== 'archived',
    allowReactivate: params.filter === 'all' || params.filter === 'archived'
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
            ProductDefinition: true
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
  archive: async (event) => {
    const session = await event.locals.auth();
    if (!session) return fail(403);
    const orgId = parseInt(event.params.id!);
    if (isNaN(orgId) || !(orgId + '' === event.params.id)) return fail(404);

    const form = await superValidate(event.request, valibot(bulkProjectOperationSchema));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    if (
      !form.data.projects.reduce((p, c) => p && canModifyProject(session, c.OwnerId, orgId), true)
    ) {
      return fail(403);
    }

    await Promise.all(
      form.data.projects.map(async ({ Id }) => {
        const project = await prisma.projects.findUnique({
          where: {
            Id: Id
          },
          select: {
            Id: true,
            DateArchived: true
          }
        });
        if (form.data.operation === 'archive' && !project?.DateArchived) {
          await DatabaseWrites.projects.update(Id, {
            DateArchived: new Date()
          });
          await Queues.UserTasks.add(`Delete UserTasks for Archived Project #${Id}`, {
            type: BullMQ.JobType.UserTasks_Modify,
            scope: 'Project',
            projectId: Id,
            operation: {
              type: BullMQ.UserTasks.OpType.Delete
            }
          });
        } else if (form.data.operation === 'reactivate' && !!project?.DateArchived) {
          await DatabaseWrites.projects.update(Id, {
            DateArchived: null
          });
          await Queues.UserTasks.add(`Create UserTasks for Reactivated Project #${Id}`, {
            type: BullMQ.JobType.UserTasks_Modify,
            scope: 'Project',
            projectId: Id,
            operation: {
              type: BullMQ.UserTasks.OpType.Create
            }
          });
        }
      })
    );

    return { form, ok: true };
  }
};
