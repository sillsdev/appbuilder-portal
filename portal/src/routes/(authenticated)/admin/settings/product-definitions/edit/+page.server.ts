import { localizeHref } from '$lib/paraglide/runtime';
import { idSchema } from '$lib/valibot';
import { fail, redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  applicationType: idSchema,
  workflow: idSchema,
  rebuildWorkflow: v.nullable(idSchema),
  republishWorkflow: v.nullable(idSchema),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string())
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, localizeHref('/admin/settings/product-definitions'));
  }
  const options = {
    applicationTypes: await prisma.applicationTypes.findMany(),
    workflows: await prisma.workflowDefinitions.findMany()
  };
  const data = await prisma.productDefinitions.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, localizeHref('/admin/settings/product-definitions'));
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      applicationType: data.TypeId,
      workflow: data.WorkflowId,
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
  async edit({ request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    await DatabaseWrites.productDefinitions.update({
      where: {
        Id: form.data.id
      },
      data: {
        TypeId: form.data.applicationType,
        Name: form.data.name,
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
