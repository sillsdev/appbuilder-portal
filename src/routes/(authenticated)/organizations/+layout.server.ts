import type { LayoutServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireAdminOfAny();

  const organizations = await DatabaseReads.organizations.findMany({
    where: event.locals.security.isSuperAdmin
      ? {}
      : {
          UserRoles: {
            some: {
              UserId: event.locals.security.userId,
              RoleId: RoleId.OrgAdmin
            }
          }
        },
    select: {
      Id: true,
      LogoUrl: true,
      Name: true,
      ContactEmail: true
    }
  });
  return { organizations };
}) satisfies LayoutServerLoad;
