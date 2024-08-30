import prisma from '../prisma.js';

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
