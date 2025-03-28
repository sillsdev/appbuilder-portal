import { idSchema } from '$lib/valibot';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editStoresSchema = v.object({
  id: idSchema,
  stores: v.array(
    v.object({
      storeId: idSchema,
      enabled: v.boolean()
    })
  )
});
export const load = (async (event) => {
  const { organization } = await event.parent();
  const orgStores = await prisma.organizationStores.findMany({
    where: {
      OrganizationId: organization.Id
    }
  });
  const allStores = (await prisma.stores.findMany()).map((s) => [s.Id, s] as [number, typeof s]);
  const setOrgStores = new Set(orgStores.map((p) => p.StoreId));
  const form = await superValidate(
    {
      id: organization.Id,
      stores: allStores.map((s) => ({
        storeId: s[0],
        enabled: setOrgStores.has(s[0])
      }))
    },
    valibot(editStoresSchema)
  );
  return { orgStores, allStores, form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(editStoresSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    await DatabaseWrites.organizationStores.updateOrganizationStores(
      form.data.id,
      form.data.stores.filter((s) => s.enabled).map((s) => s.storeId)
    );
    return { ok: true, form };
  }
} satisfies Actions;
