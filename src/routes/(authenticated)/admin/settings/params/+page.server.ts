import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { JSONSchema } from '$lib/valibot';

const settingsSchema = v.record(v.string(), JSONSchema());

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();

  const settings = await DatabaseReads.adminSettings.findMany({
    include: { ModifiedBy: { select: { Name: true } } }
  });

  const form = await superValidate(
    Object.fromEntries(settings.map(({ Key, Value }) => [Key, Value])),
    valibot(settingsSchema)
  );

  return { form, settings };
}) satisfies PageServerLoad;

export const actions = {
  async default({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(settingsSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.adminSettings.update(locals.security.userId, form.data);
    return { ok: true, form };
  }
} satisfies Actions;
