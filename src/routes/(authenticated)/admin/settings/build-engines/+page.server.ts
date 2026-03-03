// src/routes/admin/settings/build-engines/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();

  return {
    buildEngines: await DatabaseReads.systemStatuses.findMany({
      where: {
        Active: true
      },
      include: {
        SupportedVersions: true,
        Organizations: { select: { Name: true }, orderBy: { Name: 'asc' } }
      }
    }),
    applications: new Map(
      (
        await DatabaseReads.applicationTypes.findMany({
          select: { Id: true, Description: true }
        })
      ).map((t) => [t.Id, t.Description])
    ),
    defaultUsers: await DatabaseReads.organizations.count({
      where: { UseDefaultBuildEngine: true }
    })
  };
}) satisfies PageServerLoad;
