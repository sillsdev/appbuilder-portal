import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { deleteSchema } from '$lib/valibot';

const addGroupSchema = v.object({
  name: v.string(),
  abbreviation: v.string()
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  return {
    groups: await DatabaseReads.groups.findMany({ where: { OwnerId: organization.Id } }),
    form: await superValidate(valibot(addGroupSchema))
  };
}) satisfies PageServerLoad;

export const actions = {
  async addGroup(event) {
    const form = await superValidate(event.request, valibot(addGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const group = await DatabaseWrites.groups.createGroup(
      form.data.name,
      form.data.abbreviation,
      parseInt(event.params.id)
    );
    return { form, ok: true, createdId: group.Id };
  },
  async deleteGroup(event) {
    const form = await superValidate(event.request, valibot(deleteSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (
      // if user modified hidden values
      !(await DatabaseReads.groups.findFirst({
        where: { Id: form.data.id, OwnerId: parseInt(event.params.id) }
      }))
    ) {
      return fail(403, { form, ok: false });
    }
    return { form, ok: await DatabaseWrites.groups.deleteGroup(form.data.id) };
  }
} satisfies Actions;
