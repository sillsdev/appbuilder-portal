// src/routes/admin/settings/build-engines/+page.server.ts

import type { PageServerLoad } from './$types';
import { activeSystems } from '$lib/organizations/server';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();

  return {
    buildEngines: await DatabaseReads.systemStatuses.findMany({
      where: activeSystems,
      include: {
        SystemVersions: true,
        Organization: { select: { Name: true } }
      }
    }),
    applications: new Map(
      (
        await DatabaseReads.applicationTypes.findMany({
          select: { Id: true, Description: true }
        })
      ).map((t) => [t.Id, t.Description])
    ),
    defaultUsers: await DatabaseReads.organizations.findMany({
      where: { UseDefaultBuildEngine: true },
      select: {
        Name: true
      }
    })
  };
}) satisfies PageServerLoad;
