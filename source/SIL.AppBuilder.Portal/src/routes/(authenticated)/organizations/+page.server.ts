import { isSuperAdmin } from '$lib/utils/roles';
import { redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const user = (await event.locals.auth())!.user;
  const organizations = isSuperAdmin(user.roles)
    ? await prisma.organizations.findMany({
      include: {
        Owner: true
      }
    })
    : await prisma.organizations.findMany({
      where: {
        OrganizationMemberships: {
          every: {
            UserId: user.userId
          }
        }
      },
      include: {
        Owner: true
      }
    });
  if (organizations.length === 1) {
    return redirect(302, '/organizations/' + organizations[0].Id + '/settings');
  }
  return { organizations };
}) satisfies PageServerLoad;
