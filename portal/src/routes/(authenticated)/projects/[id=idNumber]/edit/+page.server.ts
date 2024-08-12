import { updateProject } from '$lib/server/relationVerification/projects';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { verifyCanView } from '../common';
import type { Actions, PageServerLoad } from './$types';

const projectPropertyEditSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  group: idSchema,
  owner: idSchema,
  language: v.string(),
  description: v.nullable(v.string())
});

export const load = (async ({ locals, params }) => {
  if (!verifyCanView((await locals.auth())!, parseInt(params.id))) return error(403);
  const project = await prisma.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    }
  });
  if (!project) return error(400);
  const owners = await prisma.users.findMany({
    where: {
      OrganizationMemberships: {
        some: {
          OrganizationId: project.OrganizationId
        }
      }
    }
  });
  const groups = await prisma.groups.findMany({
    where: {
      OwnerId: project.OrganizationId
    }
  });
  const form = await superValidate(
    {
      name: project.Name!,
      group: project.GroupId,
      owner: project.OwnerId,
      language: project.Language!,
      description: project.Description
    },
    valibot(projectPropertyEditSchema)
  );
  return { project, form, owners, groups };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    if (!verifyCanView((await event.locals.auth())!, parseInt(event.params.id))) return fail(403);
    const form = await superValidate(event.request, valibot(projectPropertyEditSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (isNaN(parseInt(event.params.id))) return fail(400, { form, ok: false });
    const success = await updateProject(parseInt(event.params.id), {
      Name: form.data.name,
      GroupId: form.data.group,
      OwnerId: form.data.owner,
      Language: form.data.language,
      Description: form.data.description ?? ''
    });
    return { form, ok: success };
  }
};
