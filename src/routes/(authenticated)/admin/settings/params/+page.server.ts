import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import type { SiteParams } from '$lib/site-params';
import { byString } from '$lib/utils/sorting';
import { SiteParamSchemas, siteParamsJSONSchema } from '$lib/valibot';

const schema = v.object({
  params: v.array(
    v.pipe(
      v.object({
        Key: v.pipe(v.string(), v.picklist(Object.keys(SiteParamSchemas) as SiteParams[])),
        Value: v.nullable(v.string())
      }),
      v.check(({ Key, Value }) => v.safeParse(siteParamsJSONSchema(Key), Value).success)
    )
  )
});

export const load = (async ({ depends, locals }) => {
  locals.security.requireSuperAdmin();

  depends('admin-settings:params');

  const params = (
    await DatabaseReads.adminSettings.findMany({
      where: { Key: { in: Object.keys(SiteParamSchemas) } },
      include: { ModifiedBy: { select: { Name: true } } }
    })
  ).toSorted((a, b) => byString(a.Key, b.Key, locals.locale));

  const form = await superValidate(
    {
      params
    },
    valibot(schema)
  );

  return { form, settings: params };
}) satisfies PageServerLoad;

export const actions = {
  async default({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(schema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    await DatabaseWrites.adminSettings.updateMany(locals.security.userId, form.data.params);
    return { ok: true, form };
  }
} satisfies Actions;
