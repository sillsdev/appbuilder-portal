import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { ProjectActionString, ProjectActionType } from '$lib/prisma';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, requiredString } from '$lib/valibot';

const projectPropertyEditSchema = v.strictObject({
  Name: requiredString,
  GroupId: idSchema,
  OwnerId: idSchema,
  Language: v.string(),
  Description: v.nullable(v.string())
});

export const load = (async ({ params, locals }) => {
  const project = (await DatabaseReads.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    select: {
      Name: true,
      GroupId: true,
      OwnerId: true,
      Language: true,
      Description: true,
      OrganizationId: true
    }
  }))!;
  locals.security.requireProjectWriteAccess(project);
  return {
    project,
    form: await superValidate(
      {
        Name: project.Name,
        GroupId: project.GroupId,
        OwnerId: project.OwnerId,
        Language: project.Language,
        Description: project.Description
      },
      valibot(projectPropertyEditSchema)
    ),
    owners: await DatabaseReads.users.findMany({
      where: {
        Organizations: {
          some: {
            Id: project.OrganizationId
          }
        }
      },
      select: {
        Id: true,
        Name: true
      }
    }),
    groups: await DatabaseReads.groups.findMany({
      where: {
        OwnerId: project.OrganizationId
      },
      select: {
        Id: true,
        Name: true
      }
    }),
    jobsAvailable: QueueConnected()
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const projectId = parseInt(event.params.id);
    const project = await DatabaseReads.projects.findUnique({
      where: { Id: projectId },
      select: {
        Name: true,
        GroupId: true,
        Language: true,
        Description: true,
        OwnerId: true,
        OrganizationId: true
      }
    });
    event.locals.security.requireProjectWriteAccess(project);
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(projectPropertyEditSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // block if changing owner
    if (project!.OwnerId !== form.data.OwnerId && !QueueConnected()) return error(503);
    const success = await DatabaseWrites.projects.update(projectId, form.data);
    if (success) {
      await DatabaseWrites.projectActions.createMany({
        data: Object.entries(form.data)
          .map(([k, v]) =>
            project![k as keyof typeof form.data] !== v
              ? {
                  ProjectId: projectId,
                  UserId: event.locals.security.userId,
                  ...(k === 'OwnerId' || k === 'GroupId'
                    ? {
                        ActionType: ProjectActionType.OwnerGroup,
                        Action:
                          k === 'GroupId'
                            ? ProjectActionString.AssignGroup
                            : v === event.locals.security.userId
                              ? ProjectActionString.Claim
                              : ProjectActionString.AssignOwner,
                        ExternalId: v as number
                      }
                    : {
                        ActionType: ProjectActionType.EditField,
                        Action:
                          ProjectActionString[
                            `Edit${k as keyof Omit<typeof form.data, 'OwnerId' | 'GroupId'>}`
                          ],
                        Value: v as string
                      })
                }
              : null
          )
          .filter((o) => !!o)
      });
    }
    return { form, ok: success };
  }
};
