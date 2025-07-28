// src/routes/admin/settings/build-engines/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async () => {
  const buildEngines = await DatabaseReads.systemStatuses.findMany();

  return { buildEngines };
}) satisfies PageServerLoad;
