import prisma from '../prisma.js';
import { RoleId } from '../public/prisma.js';

export type RequirePrimitive<T> = {
  [K in keyof T]: Extract<T[K], string | number | boolean | Date>;
};

export async function getOrCreateUser(profile: {
  sub?: string | null;
  email?: string | null;
  family_name?: string | null;
  given_name?: string | null;
  name?: string | null;
}) {
  const result = await prisma.users.findFirst({
    where: {
      ExternalId: profile.sub
    },
    include: {
      UserRoles: true
    }
  });
  if (result) return result;
  return await prisma.users.create({
    data: {
      ExternalId: profile.sub,
      Email: profile.email,
      DateCreated: new Date(),
      DateUpdated: new Date(),
      FamilyName: profile.family_name,
      GivenName: profile.given_name,
      Name: profile.name,
      IsLocked: false
    },
    include: {
      UserRoles: true
    }
  });
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
