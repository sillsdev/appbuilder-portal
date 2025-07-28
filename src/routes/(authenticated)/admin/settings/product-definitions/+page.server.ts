// src/routes/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async () => {
  const productDefinitions = await DatabaseReads.productDefinitions.findMany({
    include: {
      ApplicationTypes: true,
      Workflow: true,
      RebuildWorkflow: true,
      RepublishWorkflow: true
    }
  });

  return { productDefinitions };
}) satisfies PageServerLoad;
