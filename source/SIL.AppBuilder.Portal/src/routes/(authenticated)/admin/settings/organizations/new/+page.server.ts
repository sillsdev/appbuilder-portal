import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import prisma from '$lib/prisma';
import { fail } from '@sveltejs/kit';

const createSchema = v.object({
  name: v.nullable(v.string()),
  websiteURL: v.nullable(v.string()),
  buildEngineURL: v.nullable(v.string()),
  buildEngineAccessToken: v.nullable(v.string()),
  logoURL: v.nullable(v.string()),
  useDefaultBuildEngine: v.boolean(),
  publicByDefault: v.boolean(),
  owner: v.pipe(v.number(), v.minValue(0), v.integer())
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
    try {
      const {
        buildEngineAccessToken,
        buildEngineURL,
        logoURL,
        name,
        owner,
        publicByDefault,
        useDefaultBuildEngine,
        websiteURL
      } = form.data;
      await prisma.organizations.create({
        data: {
          Name: name,
          BuildEngineApiAccessToken: buildEngineAccessToken,
          BuildEngineUrl: buildEngineURL,
          LogoUrl: logoURL,
          OwnerId: owner,
          PublicByDefault: publicByDefault,
          UseDefaultBuildEngine: useDefaultBuildEngine,
          WebsiteUrl: websiteURL
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
