import { idSchema } from '$lib/valibot';
import { DatabaseWrites } from 'sil.appbuilder.portal.common';
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
  const { organization } = await event.parent();
  const form = await superValidate(
    {
      id: organization.Id,
      buildEngineUrl: organization.BuildEngineUrl,
      buildEngineApiAccessToken: organization.BuildEngineApiAccessToken,
      useDefaultBuildEngine: organization.UseDefaultBuildEngine ?? false
    },
    valibot(infrastructureSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(infrastructureSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.id
      },
      data: {
        BuildEngineApiAccessToken: form.data.buildEngineApiAccessToken,
        BuildEngineUrl: form.data.buildEngineUrl,
        UseDefaultBuildEngine: form.data.useDefaultBuildEngine
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;
