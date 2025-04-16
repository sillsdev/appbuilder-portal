import prisma from '../prisma.js';

// Make sure that group belongs to organization the user is in
// and removed group is not linked to projects this user owns
export async function toggleForOrg(
  OrganizationId: number,
  UserId: number,
  GroupId: number,
  enabled: boolean
) {
  // check if group owned by org
  if (!(await prisma.groups.findFirst({ where: { OwnerId: OrganizationId, Id: GroupId } })))
    return false;
  // check if user is a member of the org
  if (!(await prisma.organizationMemberships.findFirst({ where: { OrganizationId, UserId } })))
    return false;
  if (enabled) {
    // ISSUE: #1102 this extra check would be unneccessary if we could switch to composite primary keys
    const existing = await prisma.groupMemberships.findFirst({
      where: { UserId, GroupId },
      select: { Id: true }
    });
    if (!existing) {
      await prisma.groupMemberships.create({
        data: { UserId, GroupId }
      });
    }
  } else {
    // check if user owns a project in this group
    if (await prisma.projects.findFirst({ where: { OwnerId: UserId, GroupId } })) return false;
    await prisma.groupMemberships.deleteMany({
      where: { UserId, GroupId }
    });
  }

  return true;
}
