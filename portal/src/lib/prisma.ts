// src/lib/prisma.ts

import type { Profile } from '@auth/sveltekit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum RoleId {
  SuperAdmin = 1,
  OrgAdmin,
  AppBuilder,
  Author
}

export async function getOrCreateUser(profile: Profile) {
  const result = await prisma.users.findFirst({
    where: {
      ExternalId: profile.sub
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
    }
  });
}

export async function getOrganizationsForUser(userId: number) {
  const user = await prisma.users.findUnique({
    where: {
      Id: userId
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
            UserId: userId
          }
        }
      },
      include: {
        Owner: true
      }
    });
  return organizations;
}

export default prisma;
