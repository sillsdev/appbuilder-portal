import { idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const addGroupSchema = v.object({
  id: idSchema,
  name: v.string(),
  abbreviation: v.string()
});
const deleteGroupSchema = v.object({
  id: idSchema
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  const addForm = await superValidate(valibot(addGroupSchema));
  const deleteForm = await superValidate(valibot(deleteGroupSchema));
  return {
    addForm,
    deleteForm,
    groups: await prisma.groups.findMany({ where: { OwnerId: organization.Id } })
  };
}) satisfies PageServerLoad;

export const actions = {
  async addGroup(event) {
    const form = await superValidate(event.request, valibot(addGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    await DatabaseWrites.groups.createGroup(form.data.name, form.data.abbreviation, form.data.id);
    return { form, ok: true };
  },
  async deleteGroup(event) {
    const form = await superValidate(event.request, valibot(deleteGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    return { form, ok: await DatabaseWrites.groups.deleteGroup(form.data.id) };
  }
} satisfies Actions;
