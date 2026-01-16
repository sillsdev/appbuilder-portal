import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { propertiesSchema } from '$lib/valibot';

const createSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1)),
  workflow: v.pipe(v.number(), v.minValue(1), v.integer()),
  rebuildWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  republishWorkflow: v.nullable(v.pipe(v.number(), v.minValue(1), v.integer())),
  description: v.nullable(v.string()),
  properties: propertiesSchema
});

export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const form = await superValidate(valibot(createSchema));
  const options = {
    applicationTypes: await DatabaseReads.applicationTypes.findMany(),
    workflows: await DatabaseReads.workflowDefinitions.findMany()
  };
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async new({ cookies, request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(createSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.productDefinitions.create({
      Name: form.data.name,
      WorkflowId: form.data.workflow,
      RebuildWorkflowId: form.data.rebuildWorkflow,
      RepublishWorkflowId: form.data.republishWorkflow,
      Description: form.data.description,
      Properties: form.data.properties
    });
    return { ok: true, form };
  }
} satisfies Actions;
