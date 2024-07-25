import prisma, { idSchema } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const infrastructureSchema = v.object({
  id: idSchema,
  buildEngineUrl: v.nullable(v.string()),
  buildEngineApiAccessToken: v.nullable(v.string()),
  useDefaultBuildEngine: v.boolean()
});

export const load = (async (event) => {
  if (isNaN(parseInt(event.params.id))) return redirect(302, '/organizations');
  const organization = await prisma.organizations.findUnique({
    where: {
      Id: parseInt(event.params.id)
    }
  });
  if (!organization) return redirect(302, '/organizations');
  const form = await superValidate(
    {
      id: organization.Id,
      buildEngineUrl: organization.BuildEngineUrl,
      buildEngineApiAccessToken: organization.BuildEngineApiAccessToken,
      useDefaultBuildEngine: organization.UseDefaultBuildEngine ?? false
    },
    valibot(infrastructureSchema)
  );
  return { organization, form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(infrastructureSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    try {
      const { id, buildEngineApiAccessToken, buildEngineUrl, useDefaultBuildEngine } = form.data;
      await prisma.organizations.update({
        where: {
          Id: id
        },
        data: {
          BuildEngineApiAccessToken: buildEngineApiAccessToken,
          BuildEngineUrl: buildEngineUrl,
          UseDefaultBuildEngine: useDefaultBuildEngine
        }
      });
      return { form, ok: true };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
