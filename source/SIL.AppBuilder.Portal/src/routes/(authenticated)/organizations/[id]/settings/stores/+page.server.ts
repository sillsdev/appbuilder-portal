import { idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const toggleStoreSchema = v.object({
  orgId: idSchema,
  storeId: idSchema,
  enabled: v.boolean()
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  const orgStores = await prisma.organizationStores.findMany({
    where: {
      OrganizationId: organization.Id
    }
  });
  const setOrgStores = new Set(orgStores.map((p) => p.StoreId));
  return {
    stores: (await prisma.stores.findMany()).map((s) => ({ ...s, enabled: setOrgStores.has(s.Id) }))
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(toggleStoreSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.orgId !== parseInt(event.params.id)) return fail(404, { form, ok: false });
    await DatabaseWrites.organizationStores.toggleForOrg(
      form.data.orgId,
      form.data.storeId,
      form.data.enabled
    );
    return { ok: true, form };
  }
} satisfies Actions;
