// src/lib/prisma.ts

import type { Auth0Profile } from '@auth/core/providers/auth0';
import type { Profile } from '@auth/sveltekit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export function getUserFromId(id: number) {
  return prisma.users.findUnique({ where: { Id: id } });
}

export default prisma;
