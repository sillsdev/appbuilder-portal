// src/routes/+page.server.ts

import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const workflowDefinitions = await prisma.workflowDefinitions.findMany({
    include: { StoreType: true }
  });

  return { workflowDefinitions };
}) satisfies PageServerLoad;
