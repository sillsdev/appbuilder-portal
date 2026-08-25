import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireNothing();
  return {
    organizations: await DatabaseReads.organizations.findMany({
      where: { VisibleToPublic: true },
      select: {
        Name: true,
        LogoUrl: true,
        ContactEmail: true
      }
    })
  };
}) satisfies PageServerLoad;
