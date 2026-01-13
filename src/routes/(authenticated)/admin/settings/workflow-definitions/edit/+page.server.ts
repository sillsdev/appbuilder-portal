import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { workflowDefinitionSchemaBase } from '../common';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  ...workflowDefinitionSchemaBase.entries
});
export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/workflow-definitions'));
  }
  const data = await DatabaseReads.workflowDefinitions.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/workflow-definitions'));
  const storeTypes = await DatabaseReads.storeTypes.findMany();
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      storeType: data.StoreTypeId!,
      productType: data.ProductType,
      workflowType: data.Type,
      description: data.Description,
      properties: data.Properties,
      options: data.WorkflowOptions,
      enabled: data.Enabled
    },
    valibot(editSchema)
  );
  return { form, storeTypes };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.workflowDefinitions.update({
      where: {
        Id: form.data.id
      },
      data: {
        Type: form.data.workflowType,
        Name: form.data.name,
        StoreTypeId: form.data.storeType,
        Description: form.data.description,
        Properties: form.data.properties,
        Enabled: form.data.enabled,
        ProductType: form.data.productType,
        WorkflowOptions: form.data.options
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
