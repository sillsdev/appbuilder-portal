import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { organizationBaseSchema } from '$lib/organizations';
import { DatabaseWrites } from '$lib/server/database';

const createSchema = organizationBaseSchema;

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  return { form: await superValidate(valibot(createSchema)) };
}) satisfies PageServerLoad;

export const actions = {
  async new({ cookies, request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.organizations.create({
      data: {
        Name: form.data.name,
        BuildEngineApiAccessToken: form.data.buildEngineApiAccessToken,
        BuildEngineUrl: form.data.buildEngineUrl,
        LogoUrl: form.data.logoUrl,
        ContactEmail: form.data.contact,
        PublicByDefault: form.data.publicByDefault,
        UseDefaultBuildEngine: form.data.useDefaultBuildEngine,
        WebsiteUrl: form.data.websiteUrl
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
