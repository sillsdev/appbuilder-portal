import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import prisma from '$lib/prisma';
import { fail } from '@sveltejs/kit';

const createSchema = v.object({
  name: v.nullable(v.string()),
  description: v.nullable(v.string())
});

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async new({ cookies, request }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    try {
      const { name, description } = form.data;
      await prisma.storeTypes.create({
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