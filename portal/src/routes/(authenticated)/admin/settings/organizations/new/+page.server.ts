import { fail } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { organizationBaseSchema } from '$lib/organizations';

const createSchema = organizationBaseSchema;

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
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.organizations.create({
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
