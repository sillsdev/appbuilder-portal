import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import prisma from '$lib/prisma';
import { fail } from '@sveltejs/kit';

const createSchema = v.object({
  name: v.nullable(v.string()),
  storeType: v.pipe(v.number(), v.minValue(1), v.integer()),
  workflowType: v.pipe(v.number(), v.minValue(1), v.integer()),
  workflowScheme: v.nullable(v.string()),
  workflowBusinessFlow: v.nullable(v.string()),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string()),
  enabled: v.boolean()
});

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
    console.dir(form, { depth: null });
    try {
      const {
        name,
        description,
        properties,
        enabled,
        storeType,
        workflowBusinessFlow,
        workflowScheme,
        workflowType
      } = form.data;
      await prisma.workflowDefinitions.create({
        data: {
          Name: name,
          Description: description,
          Properties: properties,
          Enabled: enabled,
          StoreTypeId: storeType,
          WorkflowBusinessFlow: workflowBusinessFlow,
          WorkflowScheme: workflowScheme,
          Type: workflowType
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
