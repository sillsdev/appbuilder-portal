import prisma from '$lib/prisma';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

const editSchema = v.object({
  id: v.pipe(v.number(), v.minValue(0), v.integer()),
  name: v.nullable(v.string()),
  applicationType: v.pipe(v.number(), v.minValue(0), v.integer()),
  workflow: v.pipe(v.number(), v.minValue(0), v.integer()),
  rebuildWorkflow: v.nullable(v.pipe(v.number(), v.minValue(0), v.integer())),
  republishWorkflow: v.nullable(v.pipe(v.number(), v.minValue(0), v.integer())),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string())
});
// const requestSchema = v.object({
//   id: v.pipe(v.number(), v.minValue(0), v.integer())
// });
export const load = (async ({ url }) => {
  //   const requestForm = await superValidate(
  //     Object.fromEntries(url.searchParams),
  //     valibot(requestSchema)
  //   );
  //   console.log(request);
  //   console.log(requestForm);
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
    // const data = Object.fromEntries(await request.formData());
    const form = await superValidate(request, valibot(editSchema));
    console.log(form);
    if (!form.valid) {
      return fail(400, { form });
    }
    return { ok: true };
    // try {
    //   const {
    //     id,
    //     name,
    //     applicationType,
    //     workflow,
    //     rebuildWorkflow,
    //     republishWorkflow,
    //     description,
    //     properties
    //   } = form.data;
    //   await prisma.productDefinitions.update({
    //     where: {
    //       Id: id
    //     },
    //     data: {
    //       TypeId: applicationType,
    //       Name: name,
    //       WorkflowId: workflow,
    //       RebuildWorkflowId: rebuildWorkflow,
    //       RepublishWorkflowId: republishWorkflow,
    //       Description: description,
    //       Properties: properties
    //     }
    //   });
    // } catch (e) {
    //   if (e instanceof v.ValiError) return { errors: e.issues };
    //   throw e;
    // }
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