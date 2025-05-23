import { infrastructureSchema } from '$lib/organizations';
import { DatabaseWrites } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
  const { organization } = await event.parent();
  const form = await superValidate(
    {
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
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.organizations.update({
      where: {
        Id: parseInt(event.params.id)
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
