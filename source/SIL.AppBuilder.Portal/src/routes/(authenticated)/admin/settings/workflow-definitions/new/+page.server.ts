import { fail } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { workflowDefinitionSchemaBase } from '../common';

const createSchema = workflowDefinitionSchemaBase;

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  const options = {
    storeType: await prisma.storeTypes.findMany()
  };

  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async new({ cookies, request }) {
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    try {
      const {
        name,
        description,
        properties,
        enabled,
        storeType,
        workflowBusinessFlow,
        workflowScheme,
        workflowType,
        productType,
        options
      } = form.data;
      await DatabaseWrites.workflowDefinitions.create({
        data: {
          Name: name,
          Description: description,
          Properties: properties,
          Enabled: enabled,
          StoreTypeId: storeType,
          WorkflowBusinessFlow: workflowBusinessFlow,
          WorkflowScheme: workflowScheme,
          Type: workflowType,
          ProductType: productType,
          WorkflowOptions: options
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
