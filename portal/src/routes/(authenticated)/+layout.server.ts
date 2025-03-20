import { isSuperAdmin } from '$lib/utils/roles';
import { prisma } from 'sil.appbuilder.portal.common';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const user = (await event.locals.auth())!.user;
  const numberOfTasks = (
    await prisma.userTasks.findMany({
      where: {
        UserId: user.userId
      },
      select: {
        Id: true
      },
      distinct: 'ProductId'
    })
  ).length;
  const organizations = await prisma.organizations.findMany({
    where: isSuperAdmin(user.roles)
      ? undefined
      : {
          OrganizationMemberships: {
            some: {
              UserId: user.userId
            }
          }
        },
    select: {
      Id: true,
      Name: true,
      LogoUrl: true,
      Owner: {
        select: {
          Name: true
        }
      }
    }
  });
  return { organizations, numberOfTasks };
};
