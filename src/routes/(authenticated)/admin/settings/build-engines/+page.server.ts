// src/routes/admin/settings/build-engines/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const buildEngines = await DatabaseReads.systemStatuses.findMany();

  const versions = await DatabaseReads.systemVersions.findMany();

  const applications = await DatabaseReads.applicationTypes.findMany({
    select: { Id: true, Name: true }
  });

  return { buildEngines, versions, applications };
}) satisfies PageServerLoad;
