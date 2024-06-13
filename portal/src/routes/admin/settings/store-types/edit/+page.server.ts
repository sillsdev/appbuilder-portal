import prisma from '$lib/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

const editSchema = v.object({
  id: v.pipe(v.number(), v.minValue(0), v.integer()),
  name: v.nullable(v.string()),
  description: v.nullable(v.string())
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, base + '/admin/settings/store-types');
  }
  const data = await prisma.storeTypes.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, base + '/admin/settings/store-types');
  const options = await prisma.storeTypes.findMany();
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
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
      const { id, name, description } = form.data;
      await prisma.storeTypes.update({
        where: {
          Id: id
        },
        data: {
          Name: name,
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
