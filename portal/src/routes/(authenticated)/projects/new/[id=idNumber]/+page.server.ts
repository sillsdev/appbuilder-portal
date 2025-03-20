import { projectCreateSchema } from '$lib/projects';
import { verifyCanCreateProject } from '$lib/projects/server';
import { error, redirect } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
  if (!verifyCanCreateProject((await locals.auth())!, parseInt(params.id))) return error(403);

  const organization = await prisma.organizations.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    select: {
      Groups: {
        select: {
          Id: true,
          Name: true
        }
      },
      PublicByDefault: true
    }
  });

  if (!organization) return error(404);

  // There shouldn't actually be any restriction on this
  const types = await prisma.applicationTypes.findMany({
    select: {
      Id: true,
      Description: true
    }
  });

  const form = await superValidate(
    {
      group: organization.Groups.at(0)?.Id ?? undefined,
      type: types.at(0)?.Id ?? undefined,
      IsPublic: organization?.PublicByDefault ?? undefined
    },
    valibot(projectCreateSchema),
    { errors: false }
  );
  return { form, organization, types };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const session = (await event.locals.auth())!;
    const organizationId = parseInt(event.params.id);
    const form = await superValidate(event.request, valibot(projectCreateSchema));
    if (isNaN(organizationId)) return error(404);
    if (!verifyCanCreateProject(session, organizationId)) return error(403);
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    const project = await DatabaseWrites.projects.create({
      OrganizationId: organizationId,
      Name: form.data.Name,
      GroupId: form.data.group,
      OwnerId: session.user.userId,
      Language: form.data.Language,
      TypeId: form.data.type,
      Description: form.data.Description ?? '',
      IsPublic: form.data.IsPublic
    });

    if (project !== false) {
      await Queues.Miscellaneous.add(
        `Create Project #${project}`,
        {
          type: BullMQ.JobType.Project_Create,
          projectId: project as number
        },
        BullMQ.Retry5e5
      );
      return redirect(302, `/projects/${project}`);
    }
    return {
      form,
      ok: false,
      errors: [{ path: 'root', messages: ['Project could not be created.'] }]
    };
  }
};
