import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
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
  if (organizations.length === 1) {
    return redirect(302, localizeHref(`/organizations/${organizations[0].Id}/settings/info`));
  }
  return { organizations };
}) satisfies PageServerLoad;
