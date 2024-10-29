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

export async function allUsersByRole(projectId: number) {
  const project = await prisma.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      Organization: {
        select: {
          UserRoles: {
            where: {
              RoleId: RoleId.OrgAdmin
            },
            select: {
              UserId: true
            }
          }
        }
      },
      OwnerId: true,
      Authors: {
        select: {
          UserId: true
        }
      }
    }
  });

  const map = new Map<RoleId, number[]>();

  map.set(
    RoleId.OrgAdmin,
    project.Organization.UserRoles.map((u) => u.UserId)
  );
  map.set(RoleId.AppBuilder, [project.OwnerId]);
  map.set(
    RoleId.Author,
    project.Authors.map((a) => a.UserId)
  );
  return map;
}
