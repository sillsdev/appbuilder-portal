import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, propertiesSchema, requiredString } from '$lib/valibot';

const editSchema = v.object({
  id: idSchema,
  name: requiredString,
  workflow: idSchema,
  allowAll: v.boolean(),
  applicationTypes: v.array(idSchema),
  rebuildWorkflow: v.nullable(idSchema),
  republishWorkflow: v.nullable(idSchema),
  description: v.nullable(v.string()),
  properties: propertiesSchema
});
export const load = (async ({ url, locals }) => {
  locals.security.requireSuperAdmin();
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/product-definitions'));
  }
  const options = {
    applicationTypes: await DatabaseReads.applicationTypes.findMany(),
    workflows: await DatabaseReads.workflowDefinitions.findMany()
  };
  const data = await DatabaseReads.productDefinitions.findFirst({
    where: {
      Id: id
    },
    include: {
      ApplicationTypes: true
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/product-definitions'));
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      workflow: data.WorkflowId,
      allowAll: data.AllowAllApplicationTypes,
      applicationTypes: data.ApplicationTypes.map((at) => at.Id),
      rebuildWorkflow: data.RebuildWorkflowId,
      republishWorkflow: data.RepublishWorkflowId,
      description: data.Description,
      properties: data.Properties
    },
    valibot(editSchema)
  );
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ request, locals }) {
    locals.security.requireSuperAdmin();
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }
    await DatabaseWrites.productDefinitions.update(form.data.id, {
      Name: form.data.name,
      AllowAllApplicationTypes: form.data.allowAll,
      WorkflowId: form.data.workflow,
      RebuildWorkflowId: form.data.rebuildWorkflow,
      RepublishWorkflowId: form.data.republishWorkflow,
      Description: form.data.description,
      Properties: form.data.properties
    });
    await DatabaseWrites.productDefinitions.setApplicationTypes(
      form.data.id,
      form.data.applicationTypes
    );
    return { ok: true, form };
  }
} satisfies Actions;
