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
  enabled: v.boolean()
});
export const load = (async ({ url, locals, params }) => {
  const orgId = parseInt(params.id);
  locals.security.requireAdminOfOrg(orgId);
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref(`/organizations/${orgId}/settings/stores`));
  }
  const data = await DatabaseReads.stores.findFirst({
    where: {
      Id: id
    },
    include: {
      StoreType: true,
      Organizations: { where: { Id: orgId }, select: { Id: true } }
    }
  });
  if (!data) return redirect(302, localizeHref(`/organizations/${orgId}/settings/stores`));
  const form = await superValidate(
    {
      id: data.Id,
      publisherId: data.BuildEnginePublisherId,
      storeType: data.StoreTypeId!,
      description: data.Description,
      gpTitle: data.GooglePlayTitle,
      enabled: !!data.Organizations.length
    },
    valibot(editSchema)
  );
  return { form, storeType: data.StoreType.Description };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals, params }) {
    const orgId = parseInt(params.id);
    locals.security.requireAdminOfOrg(orgId);
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
      GooglePlayTitle: form.data.gpTitle
    });
    await DatabaseWrites.stores.toggleForOrg(form.data.id, orgId, form.data.enabled);
    return { ok: true, form };
  }
} satisfies Actions;
