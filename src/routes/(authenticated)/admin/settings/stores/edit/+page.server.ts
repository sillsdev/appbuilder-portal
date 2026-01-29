import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  publisherId: v.pipe(v.string(), v.trim(), v.minLength(1)),
  description: v.nullable(v.string()),
  storeType: idSchema,
  gpTitle: v.nullable(v.string()),
  owner: v.nullable(idSchema)
});
export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/stores'));
  }
  const store = await DatabaseReads.stores.findFirst({
    where: {
      Id: id
    },
    include: { StoreType: true }
  });
  if (!store) return redirect(302, localizeHref('/admin/settings/stores'));

  return {
    store,
    form: await superValidate(
      {
        id: store.Id,
        description: store.Description,
        storeType: store.StoreTypeId,
        gpTitle: store.GooglePlayTitle,
        owner: store.OwnerId
      },
      valibot(editSchema)
    ),
    options: await DatabaseReads.storeTypes.findMany()
  };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.stores.update(form.data.id, {
      // Don't write publisherId to database here.
      // The publishing process requires the publisherId to stay the same.
      // Changing the publisherId of the store will require a more involved UI.
      // See #1383 and #1378
      Description: form.data.description,
      GooglePlayTitle: form.data.gpTitle,
      OwnerId: form.data.owner
    });
    return { ok: true, form };
  }
} satisfies Actions;
