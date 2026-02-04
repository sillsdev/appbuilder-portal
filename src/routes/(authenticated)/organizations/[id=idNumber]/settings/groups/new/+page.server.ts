import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, requiredString } from '$lib/valibot';

const addGroupSchema = v.object({
  name: requiredString,
  description: v.string(),
  users: v.array(idSchema),
  groups: v.array(idSchema)
});

export const load = (async (event) => {
  event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
  const { organization } = await event.parent();
  return {
    users: await DatabaseReads.users.findMany({
      where: { Organizations: { some: { Id: organization.Id } }, IsLocked: false },
      select: {
        Id: true,
        Name: true,
        Email: true
      }
    }),
    groups: await DatabaseReads.groups.findMany({
      where: { OwnerId: organization.Id, Users: { some: { IsLocked: false } } },
      select: {
        Id: true,
        Name: true,
        _count: {
          select: {
            Users: {
              where: {
                IsLocked: false
              }
            }
          }
        }
      }
    }),
    form: await superValidate(valibot(addGroupSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  async new(event) {
    event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
    const form = await superValidate(event.request, valibot(addGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const group = await DatabaseWrites.groups.createGroup(
      form.data.name,
      form.data.description,
      parseInt(event.params.id),
      form.data.users,
      form.data.groups
    );
    return { form, ok: true, createdId: group.Id };
  }
} satisfies Actions;
