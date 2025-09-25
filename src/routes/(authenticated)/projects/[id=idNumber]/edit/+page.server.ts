import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const projectPropertyEditSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  group: idSchema,
  owner: idSchema,
  language: v.string(),
  description: v.nullable(v.string())
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
        name: project.Name!,
        group: project.GroupId,
        owner: project.OwnerId,
        language: project.Language!,
        description: project.Description
      },
      valibot(projectPropertyEditSchema)
    ),
    owners: await DatabaseReads.users.findMany({
      where: {
        OrganizationMemberships: {
          some: {
            OrganizationId: project.OrganizationId
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
      select: { OwnerId: true, OrganizationId: true }
    });
    event.locals.security.requireProjectWriteAccess(project);
    if (!QueueConnected()) return error(503);
    const form = await superValidate(event.request, valibot(projectPropertyEditSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // block if changing owner
    if (project!.OwnerId !== form.data.owner && !QueueConnected()) return error(503);
    const success = await DatabaseWrites.projects.update(projectId, {
      Name: form.data.name,
      GroupId: form.data.group,
      OwnerId: form.data.owner,
      Language: form.data.language,
      Description: form.data.description ?? ''
    });
    return { form, ok: success };
  }
};
