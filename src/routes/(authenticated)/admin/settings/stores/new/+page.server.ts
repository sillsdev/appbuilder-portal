import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, requiredString } from '$lib/valibot';

const createSchema = v.object({
  publisherId: requiredString,
  storeType: v.pipe(v.number(), v.minValue(1), v.integer()),
  description: v.nullable(v.string()),
  gpTitle: v.nullable(v.string()),
  owner: v.nullable(idSchema)
});

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const form = await superValidate(valibot(createSchema));
  const options = {
    storeType: await DatabaseReads.storeTypes.findMany()
  };
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async new({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.stores.create({
      BuildEnginePublisherId: form.data.publisherId,
      Description: form.data.description,
      StoreTypeId: form.data.storeType,
      GooglePlayTitle: form.data.gpTitle,
      OwnerId: form.data.owner
    });
    return { ok: true, form };
  }
} satisfies Actions;
