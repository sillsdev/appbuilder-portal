import prisma, { idSchema } from '$lib/prisma';
import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const projectPropertyEditSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  group: idSchema,
  owner: idSchema,
  language: v.string(),
  description: v.nullable(v.string()),
  allowDownload: v.boolean(),
  public: v.boolean()
});

export const load = (async ({ params }) => {
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
      description: project.Description,
      allowDownload: !!project.AllowDownloads,
      public: !!project.IsPublic
    },
    valibot(projectPropertyEditSchema)
  );
  return { project, form, owners, groups };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const form = await superValidate(event.request, valibot(projectPropertyEditSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (isNaN(parseInt(event.params.id))) return fail(400, { form, ok: false });
    await prisma.projects.update({
      where: {
        Id: parseInt(event.params.id)
      },
      data: {
        Name: form.data.name,
        GroupId: form.data.group,
        OwnerId: form.data.owner,
        Language: form.data.language,
        Description: form.data.description ?? '',
        AllowDownloads: form.data.allowDownload,
        IsPublic: form.data.public
      }
    });
    return { form, ok: true };
  }
};
