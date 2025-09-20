// src/routes/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const workflowDefinitions = await DatabaseReads.workflowDefinitions.findMany({
    include: { StoreType: true }
  });

  return { workflowDefinitions };
}) satisfies PageServerLoad;
