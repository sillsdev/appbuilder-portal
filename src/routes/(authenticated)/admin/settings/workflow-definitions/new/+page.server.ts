import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { workflowDefinitionSchemaBase } from '../common';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

const createSchema = workflowDefinitionSchemaBase;

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const form = await superValidate(valibot(createSchema));
  const options = {
    storeType: await DatabaseReads.storeTypes.findMany(),
    schemes: await DatabaseReads.workflowScheme.findMany({ select: { Code: true } })
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
    await DatabaseWrites.workflowDefinitions.create({
      data: {
        Name: form.data.name,
        Description: form.data.description,
        Properties: form.data.properties,
        Enabled: form.data.enabled,
        StoreTypeId: form.data.storeType,
        WorkflowBusinessFlow: form.data.workflowBusinessFlow,
        WorkflowScheme: form.data.workflowScheme,
        Type: form.data.workflowType,
        ProductType: form.data.productType,
        WorkflowOptions: form.data.options
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
