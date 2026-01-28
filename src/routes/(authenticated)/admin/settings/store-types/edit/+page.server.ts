import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, requiredString } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  name: requiredString,
  description: v.nullable(v.string())
});
export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/store-types'));
  }
  const data = await DatabaseReads.storeTypes.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/store-types'));
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      description: data.Description
    },
    valibot(editSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.storeTypes.update({
      where: {
        Id: form.data.id
      },
      data: {
        Name: form.data.name,
        Description: form.data.description
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
