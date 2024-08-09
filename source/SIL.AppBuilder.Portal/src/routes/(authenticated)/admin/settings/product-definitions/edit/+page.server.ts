import { base } from '$app/paths';
import { idSchema } from '$lib/valibot';
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
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
    return redirect(302, base + '/admin/settings/product-definitions');
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
  if (!data) return redirect(302, base + '/admin/settings/product-definitions');
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
  async edit({ cookies, request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    try {
      const {
        id,
        name,
        applicationType,
        workflow,
        rebuildWorkflow,
        republishWorkflow,
        description,
        properties
      } = form.data;
      await prisma.productDefinitions.update({
        where: {
          Id: id
        },
        data: {
          TypeId: applicationType,
          Name: name,
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
    // const Id = data.get('id');
    // const name = data.get('name');
    // const applicationType = data.get('applicationType');
    // const workflow = data.get('workflow');
    // const rebuildWorkflow = data.get('rebuildWorkflow');
    // const republishWorkflow = data.get('republishWorkflow');
    // const description = data.get('description');
    // const properties = data.get('properties');
  }
} satisfies Actions;
