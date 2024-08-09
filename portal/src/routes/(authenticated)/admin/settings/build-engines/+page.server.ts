// src/routes/admin/settings/build-engines/+page.server.ts

import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const buildEngines = await prisma.systemStatuses.findMany();

  return { buildEngines };
}) satisfies PageServerLoad;
