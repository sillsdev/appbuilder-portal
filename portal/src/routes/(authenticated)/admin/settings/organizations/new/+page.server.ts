import { idSchema } from '$lib/valibot';
import { fail } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const createSchema = v.object({
  name: v.nullable(v.string()),
  websiteURL: v.nullable(v.string()),
  buildEngineURL: v.nullable(v.string()),
  buildEngineAccessToken: v.nullable(v.string()),
  logoURL: v.nullable(v.string()),
  useDefaultBuildEngine: v.optional(v.boolean(), true),
  publicByDefault: v.boolean(),
  owner: idSchema
});

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  const options = {
    users: await prisma.users.findMany()
  };
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async new({ cookies, request }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    await DatabaseWrites.organizations.create({
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
    return { ok: true, form };
  }
} satisfies Actions;
