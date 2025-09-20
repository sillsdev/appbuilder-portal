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
  const orgStores = await DatabaseReads.organizationStores.findMany({
    where: {
      OrganizationId: organization.Id
    }
  });
  const setOrgStores = new Set(orgStores.map((p) => p.StoreId));
  return {
    stores: (await DatabaseReads.stores.findMany()).map((s) => ({
      ...s,
      enabled: setOrgStores.has(s.Id)
    }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
    const form = await superValidate(event.request, valibot(toggleStoreSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.organizationStores.toggleForOrg(
      parseInt(event.params.id),
      form.data.storeId,
      form.data.enabled
    );
    return { ok: true, form };
  }
} satisfies Actions;
