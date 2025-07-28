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
  name: v.nullable(v.string()),
  description: v.nullable(v.string()),
  storeType: idSchema
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/stores'));
  }
  const data = await DatabaseReads.stores.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/stores'));
  const options = await DatabaseReads.storeTypes.findMany();
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
  async edit({ request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.stores.update({
      where: {
        Id: form.data.id
      },
      data: {
        Name: form.data.name,
        StoreTypeId: form.data.storeType,
        Description: form.data.description
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
