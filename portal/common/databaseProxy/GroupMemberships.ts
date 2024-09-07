import prisma from '../prisma.js';

// Make sure that all groups belong to organizations the user is in
// and removed groups are not linked to projects this user owns
export async function updateUserGroups(userId: number, groups: number[]): Promise<boolean> {
  const currentGroups = (
    await prisma.groupMemberships.findMany({
      where: {
        UserId: userId
      }
    })
  ).map((g) => g.GroupId);
  const removedGroups = currentGroups.filter((group) => !groups.includes(group));
  // Are there any removed groups that have a project this user owns
  for (const group of removedGroups) {
    if (
      (
        await prisma.projects.findMany({
          where: {
            OwnerId: userId,
            GroupId: group
          }
        })
      ).length > 0
    ) {
      return false;
    }
  }

  const userOrganizations = await prisma.organizationMemberships.findMany({
    where: {
      UserId: userId
    }
  });
  // Are there any groups we are setting that are not owned by one of the user's organizations
  if (
    await prisma.groups.findFirst({
      where: {
        Id: {
          in: groups
        },
        OwnerId: {
          notIn: userOrganizations.map((o) => o.OrganizationId)
        }
      }
    })
  )
    return false;

  // Verified, perform the changes
  await prisma.$transaction([
    prisma.groupMemberships.deleteMany({
      where: {
        GroupId: {
          in: removedGroups
        }
      }
    }),
    prisma.groupMemberships.createMany({
      data: groups
        .filter((group) => !currentGroups.includes(group))
        .map((group) => ({
          GroupId: group,
          UserId: userId
        }))
    })
  ]);
  return true;
}
