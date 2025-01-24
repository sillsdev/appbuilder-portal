import { fail } from '@sveltejs/kit';
import { DatabaseWrites } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const createSchema = v.object({
  name: v.nullable(v.string()),
  description: v.nullable(v.string())
});

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async new({ request }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    await DatabaseWrites.storeTypes.create({
      data: {
        Name: form.data.name,
        Description: form.data.description
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
