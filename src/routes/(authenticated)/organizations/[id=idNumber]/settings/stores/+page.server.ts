import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const toggleStoreSchema = v.object({
  storeId: idSchema,
  enabled: v.boolean()
});

export const load = (async (event) => {
  event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
  const { organization } = await event.parent();
  return {
    stores: (
      await DatabaseReads.stores.findMany({
        include: {
          Organizations: { where: { Id: organization.Id }, select: { Id: true } },
          StoreType: true,
          Owner: { select: { Name: true } }
        }
      })
    ).map((s) => ({
      ...s,
      enabled: !!s.Organizations.length
    }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
    const form = await superValidate(event.request, valibot(toggleStoreSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.stores.toggleForOrg(
      form.data.storeId,
      parseInt(event.params.id),
      form.data.enabled
    );
    return { ok: true, form };
  }
} satisfies Actions;
