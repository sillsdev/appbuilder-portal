import { redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const auth = await event.locals.auth();
  const user = await prisma.users.findUnique({
    where: {
      Id: auth?.user.userId
    },
    include: { UserRoles: true, Organizations: true }
  });
  const organizations = user?.UserRoles.find((roleDef) => roleDef.RoleId === RoleId.SuperAdmin)
    ? await prisma.organizations.findMany({
      include: {
        Owner: true
      }
    })
    : await prisma.organizations.findMany({
      where: {
        OrganizationMemberships: {
          every: {
            UserId: auth?.user.userId
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
