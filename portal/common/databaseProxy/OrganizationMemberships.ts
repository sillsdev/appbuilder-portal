import prisma from '../prisma.js';

export async function acceptOrganizationInvite(userId: number, inviteToken: string) {
  const invite = await prisma.organizationMembershipInvites.findFirst({
    where: {
      Token: inviteToken
    }
  });
  if (!invite || invite.Redeemed || !invite.Expires || invite.Expires < new Date()) return false;
  // Check if the user is already a member of the organization
  // This could be done such that they can accept the invite to get the roles and groups
  const existingMembership = await prisma.organizationMemberships.findFirst({
    where: {
      UserId: userId,
      OrganizationId: invite.OrganizationId
    }
  });
  if (existingMembership) return false;
  await prisma.organizationMemberships.create({
    data: {
      UserId: userId,
      OrganizationId: invite.OrganizationId
    }
  });
  await prisma.userRoles.createMany({
    data: invite.Roles.map((r) => ({
      UserId: userId,
      RoleId: r,
      OrganizationId: invite.OrganizationId
    }))
  });
  // Make sure that we don't try to add the user to groups that have since been deleted
  const existingGroups = (
    await prisma.groups.findMany({
      where: {
        OwnerId: invite.OrganizationId
      }
    })
  ).map((g) => g.Id);
  await prisma.groupMemberships.createMany({
    data: invite.Groups.map((g) => ({
      UserId: userId,
      GroupId: g
    })).filter((l) => existingGroups.includes(l.GroupId))
  });

  await prisma.organizationMembershipInvites.update({
    where: {
      Id: invite.Id
    },
    data: {
      Redeemed: true
    }
  });
  return true;
}

// Technically only modifies OrganizationMembershipInvites but we'll keep all membership functions together
export async function createOrganizationInvite(
  email: string,
  organizationId: number,
  invitedById: number,
  roles: number[],
  groups: number[]
) {
  // Note: this email is never used except to send the initial email.
  // It sits in the database for reference sake only
  const invite = await prisma.organizationMembershipInvites.create({
    data: {
      InvitedById: invitedById,
      Email: email,
      OrganizationId: organizationId,
      Roles: roles,
      Groups: groups
    }
  });
  return invite.Token;
}
