import prisma from '../prisma.js';
import { RoleId } from '../public/prisma.js';

export async function setUserRolesForOrganization(
  userId: number,
  organizationId: number,
  roles: RoleId[]
) {
  const old = (
    await prisma.userRoles.findMany({
      where: {
        UserId: userId,
        OrganizationId: organizationId
      }
    })
  ).map((r) => r.RoleId);
  const remove = old.filter((role) => !roles.includes(role));
  const add = roles.filter((role) => !old.includes(role));
  await prisma.$transaction([
    prisma.userRoles.deleteMany({
      where: {
        UserId: userId,
        OrganizationId: organizationId,
        RoleId: {
          in: remove
        }
      }
    }),
    prisma.userRoles.createMany({
      data: add.map((r) => ({
        UserId: userId,
        OrganizationId: organizationId,
        RoleId: r
      }))
    })
  ]);
}
