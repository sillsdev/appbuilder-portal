// src/routes/admin/settings/build-engines/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const buildEngines = await DatabaseReads.systemStatuses.findMany({
    include: { SupportedVersions: true, Organizations: { select: { Name: true } } }
  });

  const applications = await DatabaseReads.applicationTypes.findMany({
    select: { Id: true, Description: true }
  });

  return {
    buildEngines,
    applications,
    defaultUsers: await DatabaseReads.organizations.count({
      where: { UseDefaultBuildEngine: true }
    })
  };
}) satisfies PageServerLoad;
