import prisma from './prisma';

// Make sure that group belongs to organization the user is in
// and removed group is not linked to projects this user owns
export async function toggleForOrg(
  OrganizationId: number,
  UserId: number,
  GroupId: number,
  enabled: boolean
) {
  // check if group owned by org
  const orgOwnsGroup = await prisma.groups.findFirst({
    where: { OwnerId: OrganizationId, Id: GroupId },
    select: { Id: true }
  });
  // check if user is a member of the org
  const userInOrg = await prisma.users.findFirst({
    where: { Organizations: { some: { Id: OrganizationId } }, Id: UserId },
    select: { Id: true }
  });
  // check if user owns a project in this group
  // this is the only check not precluded by the UI
  const userHasProjectInGroup = await prisma.projects.findFirst({
    where: { OwnerId: UserId, GroupId },
    select: { Id: true }
  });

  return (
    orgOwnsGroup &&
    userInOrg &&
    (enabled || !userHasProjectInGroup) &&
    !!(await prisma.users.update({
      where: { Id: UserId },
      data: {
        Groups: {
          [enabled ? 'connect' : 'disconnect']: {
            Id: GroupId
          }
        }
      },
      select: {
        Id: true
      }
    }))
  );
}
