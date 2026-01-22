import type { Profile } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';
export async function create(profile: Profile) {
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
      FamilyName: profile.family_name,
      GivenName: profile.given_name,
      Name: profile.name,
      IsLocked: false
    }
  });
}

export async function update(
  id: number,
  userData: RequirePrimitive<Prisma.UsersUncheckedUpdateInput>
) {
  return await prisma.users.update({
    where: { Id: id },
    data: userData
  });
}

export async function byExternalId(externalId: string) {
  return await prisma.users.findFirst({
    where: {
      ExternalId: externalId
    }
  });
}

