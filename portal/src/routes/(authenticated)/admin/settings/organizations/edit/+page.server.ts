import { base } from '$app/paths';
import { idSchema } from '$lib/valibot';
import { fail, redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  owner: idSchema,
  websiteURL: v.nullable(v.string()),
  buildEngineURL: v.nullable(v.string()),
  buildEngineAccessToken: v.nullable(v.string()),
  logoURL: v.nullable(v.string()),
  publicByDefault: v.boolean(),
  useDefaultBuildEngine: v.boolean(),
  stores: v.array(
    v.object({
      storeId: idSchema,
      enabled: v.boolean()
    })
  )
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, base + '/admin/settings/organizations');
  }
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
  if (!data) return redirect(302, base + '/admin/settings/organizations');
  const users = await prisma.users.findMany();
  const orgStoreNumList = new Set(orgStores.map((s) => s.StoreId));
  const stores = await prisma.stores.findMany();
  const enabledStores = stores.map((store) => ({
    storeId: store.Id,
    enabled: orgStoreNumList.has(store.Id)
  }));
  const options = { users, stores };
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      owner: data.OwnerId,
      websiteURL: data.WebsiteUrl,
      buildEngineURL: data.BuildEngineUrl,
      buildEngineAccessToken: data.BuildEngineApiAccessToken,
      logoURL: data.LogoUrl,
      useDefaultBuildEngine: data.UseDefaultBuildEngine ?? true,
      publicByDefault: data.PublicByDefault ?? false,
      stores: enabledStores
    },
    valibot(editSchema)
  );
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.id
      },
      data: {
        Name: form.data.name,
        BuildEngineApiAccessToken: form.data.buildEngineAccessToken,
        BuildEngineUrl: form.data.buildEngineURL,
        LogoUrl: form.data.logoURL,
        OwnerId: form.data.owner,
        PublicByDefault: form.data.publicByDefault,
        UseDefaultBuildEngine: form.data.useDefaultBuildEngine,
        WebsiteUrl: form.data.websiteURL
      }
    });
    await DatabaseWrites.organizationStores.updateOrganizationStores(
      form.data.id,
      form.data.stores.filter((s) => s.enabled).map((s) => s.storeId)
    );

    return { ok: true, form };
  }
} satisfies Actions;
