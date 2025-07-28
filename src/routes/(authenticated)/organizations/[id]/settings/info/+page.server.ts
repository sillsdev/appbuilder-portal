import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { infoSchema } from '$lib/organizations';
import { DatabaseWrites } from '$lib/server/database';

export const load = (async (event) => {
  const { organization } = await event.parent();
  const form = await superValidate(
    {
      name: organization.Name,
      logoUrl: organization.LogoUrl
    },
    valibot(infoSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(infoSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await DatabaseWrites.organizations.update({
      where: {
        Id: parseInt(event.params.id)
      },
      data: {
        Name: form.data.name,
        LogoUrl: form.data.logoUrl
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;
