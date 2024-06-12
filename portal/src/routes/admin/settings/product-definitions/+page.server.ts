// src/routes/+page.server.ts

import { ZodError, z } from 'zod';
import prisma from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';

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
  const options = {
    applicationTypes: await prisma.applicationTypes.findMany(),
    workflows: await prisma.workflowDefinitions.findMany()
  };

  return { productDefinitions, options };
}) satisfies PageServerLoad;

const editSchema = z.object({
  id: z.number().positive().int(),
  name: z.string(),
  applicationType: z.number().positive().int(),
  workflow: z.number().positive().int(),
  rebuildWorkflow: z.number().positive().int(),
  republishWorkflow: z.number().positive().int(),
  description: z.string(),
  properties: z.string()
});
export const actions = {
  async edit({ cookies, request }) {
    const data = Object.fromEntries(await request.formData());
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
      } = editSchema.parse(data);
      await prisma.productDefinitions.update({
        where: {
          Id: id
        },
        data: {
          // TypeId: result.applicationType, //or
          Name: name,
          ApplicationTypes: {
            connect: {
              Id: applicationType
            }
          },
          Workflow: {
            connect: {
              Id: workflow
            }
          },
          RebuildWorkflow: {
            connect: {
              Id: rebuildWorkflow
            }
          },
          RepublishWorkflow: {
            connect: {
              Id: republishWorkflow
            }
          },
          Description: description,
          Properties: properties
        }
      });
    } catch (e) {
      if (e instanceof ZodError) return { errors: e.flatten().fieldErrors };
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
