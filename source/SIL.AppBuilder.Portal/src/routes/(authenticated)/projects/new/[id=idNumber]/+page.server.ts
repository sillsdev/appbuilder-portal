import { projectCreateSchema } from '$lib/projects/common';
import { verifyCanCreateProject } from '$lib/projects/common.server';
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
      OrganizationProductDefinitions: {
        select: {
          ProductDefinition: {
            select: {
              ApplicationTypes: true
            }
          }
        }
      },
      PublicByDefault: true
    }
  });

  const types = organization?.OrganizationProductDefinitions.map(
    (opd) => opd.ProductDefinition.ApplicationTypes
  ).reduce((p, c) => {
    if (!p.some((e) => e.Id === c.Id)) {
      p.push(c);
    }
    return p;
  }, [] as { Id: number; Name: string | null; Description: string | null }[]);

  const form = await superValidate(
    {
      group: organization?.Groups[0]?.Id ?? undefined,
      type: types?.[0].Id ?? undefined,
      IsPublic: organization?.PublicByDefault ?? undefined
    },
    valibot(projectCreateSchema)
  );
  return { form, organization, types };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async function (event) {
    const session = (await event.locals.auth())!;
    if (!verifyCanCreateProject(session, parseInt(event.params.id))) return error(403);

    const form = await superValidate(event.request, valibot(projectCreateSchema));
    // TODO: Return/Display error messages
    if (!form.valid) return fail(400, { form, ok: false });
    if (isNaN(parseInt(event.params.id))) return fail(400, { form, ok: false });
    const project = await DatabaseWrites.projects.create({
      OrganizationId: parseInt(event.params.id),
      Name: form.data.Name,
      GroupId: form.data.group,
      OwnerId: session.user.userId,
      Language: form.data.Language,
      TypeId: form.data.type,
      Description: form.data.Description ?? '',
      IsPublic: form.data.IsPublic
      // TODO: DateActive?
    });

    if (project !== false) {
      await Queues.Miscellaneous.add(`Create Project #${project}`, {
        type: BullMQ.JobType.Project_Create,
        projectId: project as number
      },
      BullMQ.Retry5e5);
      return redirect(302, `/projects/${project}`);
    }

    return { form, ok: false };
  }
};
