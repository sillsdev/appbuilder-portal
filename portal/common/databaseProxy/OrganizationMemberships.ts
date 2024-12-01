import prisma from '../prisma.js';

export async function acceptOrganizationInvite(userId: number, inviteToken: string) {
  const invite = await prisma.organizationMembershipInvites.findFirst({
    where: {
      Token: inviteToken
    }
  });
  if (!invite || invite.Redeemed || !invite.Expires || invite.Expires < new Date()) return false;
  await prisma.organizationMemberships.create({
    data: {
      UserId: userId,
      OrganizationId: invite.OrganizationId
    }
  });
  // TODO: Add user roles

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
  invitedById: number
) {
  // Note: this email is never used except to send the initial email.
  // It sits in the database for reference sake only
  const invite = await prisma.organizationMembershipInvites.create({
    data: {
      InvitedById: invitedById,
      Email: email,
      OrganizationId: organizationId
    }
  });
  return invite.Token;
}
