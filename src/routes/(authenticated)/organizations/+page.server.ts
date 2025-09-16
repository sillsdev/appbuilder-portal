import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';
import { isSuperAdmin } from '$lib/utils/roles';

export const load = (async (event) => {
  const user = (await event.locals.auth())!.user;
  const organizations = await DatabaseReads.organizations.findMany({
    where: isSuperAdmin(user.roles)
      ? {
          OrganizationMemberships: {
            some: {
              UserId: user.userId
            }
          }
        }
      : undefined,
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
