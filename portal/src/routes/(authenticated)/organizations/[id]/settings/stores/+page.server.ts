import { base } from '$app/paths';
import { idSchema } from '$lib/valibot';
import { redirect } from '@sveltejs/kit';
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
  const id = parseInt(event.params.id);
  if (isNaN(id)) return redirect(302, base + '/organizations');
  const data = await prisma.organizations.findUnique({
    where: {
      Id: id
    }
  });
  const orgStores = await prisma.organizationStores.findMany({
    where: {
      OrganizationId: id
    }
  });
  const allStores = (await prisma.stores.findMany()).map((s) => [s.Id, s] as [number, typeof s]);
  if (!data) return redirect(302, base + '/organizations');
  const setOrgStores = new Set(orgStores.map((p) => p.StoreId));
  const form = await superValidate(
    {
      id: data.Id,
      stores: allStores.map((s) => ({
        storeId: s[0],
        enabled: setOrgStores.has(s[0])
      }))
    },
    valibot(editStoresSchema)
  );
  return { organization: data, orgStores, allStores, form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(editStoresSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    try {
      const { id, stores } = form.data;
      await DatabaseWrites.organizationStores.updateOrganizationStores(
        id,
        stores.filter((s) => s.enabled).map((s) => s.storeId)
      );
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
