import prisma from '../prisma.js';

export type RequirePrimitive<T> = {
  [K in keyof T]: Extract<T[K], string | number | boolean | Date>;
};

export async function getUserIfExists(externalId: string) {
  return await prisma.users.findFirst({
    where: {
      ExternalId: externalId
    }
  });
}
export async function createUser(profile: {
  sub?: string | null;
  email?: string | null;
  family_name?: string | null;
  given_name?: string | null;
  name?: string | null;
}) {
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
