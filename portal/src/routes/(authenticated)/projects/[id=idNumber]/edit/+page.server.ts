import prisma, { idSchema } from '$lib/prisma';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';

const projectPropertyEditSchema = v.object({
  name: v.string(),
  group: idSchema,
  owner: idSchema,
  language: v.string(),
  type: idSchema,
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
  if (!project) return error(402);
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
      type: project.TypeId,
      description: project.Description,
      allowDownload: !!project.AllowDownloads,
      public: !!project.IsPublic
    },
    valibot(projectPropertyEditSchema)
  );
  return { project, form, owners, groups };
}) satisfies PageServerLoad;

export const actions = {
  default: function (event) {
    const form = superValidate(event.request, valibot(projectPropertyEditSchema));
    // TODO
  }
};
