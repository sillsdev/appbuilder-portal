import type { Prisma } from '@prisma/client';
import { redirect, type Actions } from '@sveltejs/kit';
import { DatabaseWrites, prisma, BullMQ, queues } from 'sil.appbuilder.portal.common';
import { pruneProjects } from '$lib/projects/common';
import type { PageServerLoad } from './$types';
import { superValidate, fail } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';
import { canModifyProject } from '$lib/projects/common';

const bulkProjectOperationSchema = v.object({
  operation: v.nullable(v.picklist(['archive', 'reactivate'])),
  projects: v.array(v.object({ Id: idSchema, OwnerId: idSchema, Archived: v.boolean() }))
});

export const load = (async ({ params, url, locals }) => {
  const userId = (await locals.auth())?.user.userId;
  const orgId = parseInt(params.id);
  if (isNaN(orgId) || !(orgId + '' === params.id)) {
    const paths = url.pathname.split('/');
    return redirect(302, paths.slice(0, paths.length - 1).join('/'));
  }
  const selector = params.filter as 'organization' | 'active' | 'archived' | 'all' | 'own';
  const whereStatements: Record<typeof selector, Prisma.ProjectsWhereInput> = {
    organization: {
      OrganizationId: orgId,
      DateArchived: null
    },
    active: {
      OrganizationId: orgId,
      DateActive: {
        not: null
      },
      DateArchived: null
    },
    archived: {
      OrganizationId: orgId,
      DateArchived: {
        not: null
      }
    },
    all: {
      OrganizationId: orgId
    },
    own: {
      OrganizationId: orgId,
      OwnerId: userId,
      DateArchived: null
    }
  };
  const projects = await prisma.projects.findMany({
    where: whereStatements[selector],
    include: {
      Products: {
        include: {
          ProductDefinition: true
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    }
  });
  // TODO: Likely need to paginate
  return {
    projects: pruneProjects(projects),
    form: await superValidate(valibot(bulkProjectOperationSchema)),
    allowArchive: selector !== 'archived',
    allowReactivate: selector === 'all' || selector === 'archived'
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
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
          await queues.scriptoria.add(`Delete UserTasks for Archived Project #${Id}`, {
            type: BullMQ.ScriptoriaJobType.UserTasks_Modify,
            scope: 'Project',
            projectId: Id,
            operation: {
              type: BullMQ.UserTasks.OpType.Delete,
              by: 'All'
            }
          });
        } else if (form.data.operation === 'reactivate' && !!project?.DateArchived) {
          await DatabaseWrites.projects.update(Id, {
            DateArchived: null
          });
          await queues.scriptoria.add(`Create UserTasks for Reactivated Project #${Id}`, {
            type: BullMQ.ScriptoriaJobType.UserTasks_Modify,
            scope: 'Project',
            projectId: Id,
            operation: {
              type: BullMQ.UserTasks.OpType.Create,
              by: 'All'
            }
          });
        }
      })
    );

    return { form, ok: true };
  }
};
