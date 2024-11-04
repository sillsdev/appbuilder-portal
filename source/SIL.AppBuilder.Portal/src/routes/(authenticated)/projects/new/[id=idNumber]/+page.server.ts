import { idSchema } from '$lib/valibot';
import type { Session } from '@auth/sveltekit';
import { error } from '@sveltejs/kit';
import { BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const projectCreateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  group: idSchema,
  language: v.pipe(v.string(), v.minLength(1)),
  type: idSchema,
  description: v.nullable(v.string()),
  public: v.boolean()
});

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
      public: organization?.PublicByDefault ?? undefined
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
      Name: form.data.name,
      GroupId: form.data.group,
      OwnerId: session.user.userId,
      Language: form.data.language,
      TypeId: form.data.type,
      Description: form.data.description ?? ''
      // TODO: DateActive?
    });

    if (project !== false) {
      Queues.Miscellaneous.add(`Create Project #${project}`, {
        type: BullMQ.JobType.Project_Create,
        projectId: project as number
      },
      BullMQ.Retry5e5);
    }

    return { form, ok: project !== false };
  }
};

async function verifyCanCreateProject(user: Session, orgId: number) {
  // Creating a project is allowed if the user is an OrgAdmin or AppBuilder for the organization or a SuperAdmin
  const roles = user.user.roles
    .filter(([org, role]) => org === orgId || role === RoleId.SuperAdmin)
    .map(([org, role]) => role);
  return (
    roles.includes(RoleId.AppBuilder) ||
    roles.includes(RoleId.OrgAdmin) ||
    roles.includes(RoleId.SuperAdmin)
  );
}
