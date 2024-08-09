import { base } from '$app/paths';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { idSchema } from 'sil.appbuilder.portal.common/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  description: v.nullable(v.string()),
  storeType: idSchema
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, base + '/admin/settings/stores');
  }
  const data = await prisma.stores.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, base + '/admin/settings/stores');
  const options = await prisma.storeTypes.findMany();
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      storeType: data.StoreTypeId!,
      description: data.Description
    },
    valibot(editSchema)
  );
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ cookies, request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    try {
      const { id, name, description, storeType } = form.data;
      await prisma.stores.update({
        where: {
          Id: id
        },
        data: {
          Name: name,
          StoreTypeId: storeType,
          Description: description
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
