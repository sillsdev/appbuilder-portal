// src/lib/prisma.ts

import type { Profile } from '@auth/sveltekit';
import { PrismaClient } from '@prisma/client';
import * as v from 'valibot';

const prisma = new PrismaClient();

export enum RoleId {
  SuperAdmin = 1,
  OrgAdmin,
  AppBuilder,
  Author
}

export enum ProductTransitionType {
  Activity = 1,
  StartWorkflow,
  EndWorkflow,
  CancelWorkflow,
  ProjectAccess
}
export const idSchema = v.pipe(v.number(), v.minValue(0), v.integer());

export async function getOrCreateUser(profile: Profile) {
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

export async function isUserSuperAdmin(userId: number) {
  return !!(
    await prisma.userRoles.findMany({
      where: {
        UserId: userId
      }
    })
  ).find((v) => v.RoleId === RoleId.SuperAdmin);
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
