import { idSchema } from '$lib/valibot';
import { redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editInfoSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  logoUrl: v.nullable(v.string())
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
      name: organization.Name,
      logoUrl: organization.LogoUrl
    },
    valibot(editInfoSchema)
  );
  return { organization, form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event.request, valibot(editInfoSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    try {
      const { id, name, logoUrl } = form.data;
      await DatabaseWrites.organizations.update({
        where: {
          Id: id
        },
        data: {
          Name: name,
          LogoUrl: logoUrl
        }
      });
      return { form, ok: true };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
    return { form, ok: true };
  }
} satisfies Actions;
