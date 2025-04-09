import { propertiesSchema } from '$lib/valibot';
import { fail } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const createSchema = v.object({
  name: v.nullable(v.string()),
  applicationType: v.pipe(v.number(), v.minValue(1), v.integer()),
  workflow: v.pipe(v.number(), v.minValue(1), v.integer()),
  rebuildWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  republishWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  description: v.nullable(v.string()),
  properties: propertiesSchema
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
    await DatabaseWrites.productDefinitions.create({
      data: {
        Name: form.data.name,
        TypeId: form.data.applicationType,
        WorkflowId: form.data.workflow,
        RebuildWorkflowId: form.data.rebuildWorkflow,
        RepublishWorkflowId: form.data.republishWorkflow,
        Description: form.data.description,
        Properties: form.data.properties
      }
    });
    return { ok: true, form };
  }
} satisfies Actions;
