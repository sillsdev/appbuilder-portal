import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

const schema = v.object({
  entries: v.record(v.string(), v.nullable(v.string()))
});

export const load = (async ({ depends, locals }) => {
  locals.security.requireSuperAdmin();

  depends('admin-settings:params');

  const settings = await DatabaseReads.adminSettings.findMany({
    include: { ModifiedBy: { select: { Name: true } } }
  });

  const form = await superValidate(
    {
      entries: Object.fromEntries(
        settings.map(({ Key, Value }) => [Key, Value] as [string, string | null])
      )
    },
    valibot(schema)
  );

  return { form, settings };
}) satisfies PageServerLoad;

export const actions = {
  async default({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(schema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    await DatabaseWrites.adminSettings.update(locals.security.userId, form.data.entries);
    return { ok: true, form };
  }
} satisfies Actions;
