import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import prisma from '$lib/prisma';
import { fail } from '@sveltejs/kit';

const createSchema = v.object({
  name: v.nullable(v.string()),
  applicationType: v.pipe(v.number(), v.minValue(1), v.integer()),
  workflow: v.pipe(v.number(), v.minValue(1), v.integer()),
  rebuildWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  republishWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string())
});

export const load = (async ({ url }) => {
  const form = await superValidate(valibot(createSchema));
  const options = {
    applicationTypes: await prisma.applicationTypes.findMany(),
    workflows: await prisma.workflowDefinitions.findMany()
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
        applicationType,
        workflow,
        rebuildWorkflow,
        republishWorkflow,
        description,
        properties
      } = form.data;
      await prisma.productDefinitions.create({
        data: {
          Name: name,
          TypeId: applicationType,
          WorkflowId: workflow,
          RebuildWorkflowId: rebuildWorkflow,
          RepublishWorkflowId: republishWorkflow,
          Description: description,
          Properties: properties
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;
