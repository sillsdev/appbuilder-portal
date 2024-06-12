// src/routes/+page.server.ts

import * as v from 'valibot';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
  const productDefinitions = await prisma.productDefinitions.findMany({
    include: {
      ApplicationTypes: true,
      Workflow: true,
      RebuildWorkflow: true,
      RepublishWorkflow: true
    }
  });
  // productDefinitions[0].

  return { productDefinitions };
}) satisfies PageServerLoad;

// export const actions = {
//   async edit({ cookies, request }) {
//     // const data = Object.fromEntries(await request.formData());
//     const form = await superValidate(request, valibot(editSchema));
//     console.log(form);
//     if (!form.valid) {
//       return fail(400, { form });
//     }
//     return { form };
//     // try {
//     //   const {
//     //     id,
//     //     name,
//     //     applicationType,
//     //     workflow,
//     //     rebuildWorkflow,
//     //     republishWorkflow,
//     //     description,
//     //     properties
//     //   } = form.data;
//     //   await prisma.productDefinitions.update({
//     //     where: {
//     //       Id: id
//     //     },
//     //     data: {
//     //       TypeId: applicationType,
//     //       Name: name,
//     //       WorkflowId: workflow,
//     //       RebuildWorkflowId: rebuildWorkflow,
//     //       RepublishWorkflowId: republishWorkflow,
//     //       Description: description,
//     //       Properties: properties
//     //     }
//     //   });
//     // } catch (e) {
//     //   if (e instanceof v.ValiError) return { errors: e.issues };
//     //   throw e;
//     // }
//     // const Id = data.get('id');
//     // const name = data.get('name');
//     // const applicationType = data.get('applicationType');
//     // const workflow = data.get('workflow');
//     // const rebuildWorkflow = data.get('rebuildWorkflow');
//     // const republishWorkflow = data.get('republishWorkflow');
//     // const description = data.get('description');
//     // const properties = data.get('properties');
//   }
// } satisfies Actions;
