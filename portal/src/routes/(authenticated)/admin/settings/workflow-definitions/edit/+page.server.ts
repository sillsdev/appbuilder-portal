import { base } from '$app/paths';
import { idSchema } from '$lib/valibot';
import { fail, redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { workflowDefinitionSchemaBase } from '../common';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
  id: idSchema,
  ...workflowDefinitionSchemaBase.entries
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, base + '/admin/settings/workflow-definitions');
  }
  const data = await prisma.workflowDefinitions.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, base + '/admin/settings/workflow-definitions');
  const storeTypes = await prisma.storeTypes.findMany();
  const schemes = await prisma.workflowScheme.findMany({ select: { Code: true } });
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      storeType: data.StoreTypeId!,
      productType: data.ProductType,
      workflowType: data.Type,
      workflowScheme: data.WorkflowScheme,
      workflowBusinessFlow: data.WorkflowBusinessFlow,
      description: data.Description,
      properties: data.Properties,
      options: data.WorkflowOptions,
      enabled: data.Enabled
    },
    valibot(editSchema)
  );
  return { form, storeTypes, schemes };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    await DatabaseWrites.workflowDefinitions.update({
      where: {
        Id: form.data.id
      },
      data: {
        Type: form.data.workflowType,
        Name: form.data.name,
        WorkflowScheme: form.data.workflowScheme,
        WorkflowBusinessFlow: form.data.workflowBusinessFlow,
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
