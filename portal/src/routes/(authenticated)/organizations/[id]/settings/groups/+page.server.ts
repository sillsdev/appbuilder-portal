import { deleteSchema, idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const addGroupSchema = v.object({
  orgId: idSchema,
  name: v.string(),
  abbreviation: v.string()
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  return {
    groups: await prisma.groups.findMany({ where: { OwnerId: organization.Id } })
  };
}) satisfies PageServerLoad;

export const actions = {
  async addGroup(event) {
    const form = await superValidate(event.request, valibot(addGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.groups.createGroup(
      form.data.name,
      form.data.abbreviation,
      form.data.orgId
    );
    return { form, ok: true };
  },
  async deleteGroup(event) {
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if ( // if user modified hidden values
      !(await prisma.groups.findFirst({
        where: { Id: form.data.id, OwnerId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    return { form, ok: await DatabaseWrites.groups.deleteGroup(form.data.id) };
  }
} satisfies Actions;
