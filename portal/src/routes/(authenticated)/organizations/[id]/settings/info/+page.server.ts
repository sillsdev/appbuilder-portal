import { infoSchema } from '$lib/organizations';
import { idSchema } from '$lib/valibot';
import { DatabaseWrites } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editInfoSchema = v.object({
  id: idSchema,
  ...infoSchema.entries
});

export const load = (async (event) => {
  const { organization } = await event.parent();
  const form = await superValidate(
    {
      id: organization.Id,
      name: organization.Name,
      logoUrl: organization.LogoUrl
    },
    valibot(editInfoSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(editInfoSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    // if user modified hidden values
    if (form.data.id !== parseInt(event.params.id)) return fail(403, { form, ok: false });
    await DatabaseWrites.organizations.update({
      where: {
        Id: form.data.id
      },
      data: {
        Name: form.data.name,
        LogoUrl: form.data.logoUrl
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;
