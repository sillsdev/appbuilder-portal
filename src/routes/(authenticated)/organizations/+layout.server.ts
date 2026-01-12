import type { LayoutServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { filterAdminOrgs } from '$lib/utils/roles';

export const load = (async (event) => {
  event.locals.security.requireAdminOfAny();

  const organizations = await DatabaseReads.organizations.findMany({
    where: filterAdminOrgs(event.locals.security, undefined),
    select: {
      Id: true,
      LogoUrl: true,
      Name: true,
      ContactEmail: true
    }
  });
  return { organizations };
}) satisfies LayoutServerLoad;
