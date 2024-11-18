import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const userId = (await event.locals.auth())!.user.userId;
  const numberOfTasks = await prisma.userTasks.count({
    where: {
      UserId: userId
    }
  });
  const user = await prisma.users.findUnique({
    where: {
      Id: userId
    },
    include: { UserRoles: true, Organizations: true }
  });
  const organizations = await prisma.organizations.findMany({
    where: user?.UserRoles.find((roleDef) => roleDef.RoleId === RoleId.SuperAdmin)
      ? undefined
      : {
          OrganizationMemberships: {
            every: {
              UserId: userId
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
