import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { organizationBaseSchema } from '$lib/organizations';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  ...organizationBaseSchema.entries
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/organizations'));
  }
  const data = await DatabaseReads.organizations.findUnique({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/organizations'));
  const users = await DatabaseReads.users.findMany();
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      owner: data.OwnerId,
      websiteUrl: data.WebsiteUrl,
      buildEngineUrl: data.BuildEngineUrl,
      buildEngineApiAccessToken: data.BuildEngineApiAccessToken,
      logoUrl: data.LogoUrl,
      useDefaultBuildEngine: data.UseDefaultBuildEngine ?? true,
      publicByDefault: data.PublicByDefault ?? false
    },
    valibot(editSchema)
  );
  return { form, users };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.id
      },
      data: {
        Name: form.data.name,
        BuildEngineApiAccessToken: form.data.buildEngineApiAccessToken,
        BuildEngineUrl: form.data.buildEngineUrl,
        LogoUrl: form.data.logoUrl,
        OwnerId: form.data.owner,
        PublicByDefault: form.data.publicByDefault,
        UseDefaultBuildEngine: form.data.useDefaultBuildEngine,
        WebsiteUrl: form.data.websiteUrl
      }
    });

    return { ok: true, form };
  }
} satisfies Actions;
