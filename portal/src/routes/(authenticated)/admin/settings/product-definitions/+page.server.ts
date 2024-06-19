// src/routes/+page.server.ts

import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const productDefinitions = await prisma.productDefinitions.findMany({
    include: {
      ApplicationTypes: true,
      Workflow: true,
      RebuildWorkflow: true,
      RepublishWorkflow: true
    }
  });

  return { productDefinitions };
}) satisfies PageServerLoad;
