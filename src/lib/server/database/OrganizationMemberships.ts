import prisma from './prisma';

export async function acceptOrganizationInvite(userId: number, inviteToken: string) {
  const invite = await prisma.organizationMembershipInvites.findFirst({
    where: {
      Token: inviteToken
    }
  });
  if (
    !invite ||
    invite.Redeemed ||
    !invite.Expires ||
    invite.Expires < new Date() ||
    userId === invite.InvitedById
  )
    return false;

  await prisma.users.update({
    where: {
      Id: userId
    },
    data: {
      Organizations: {
        connect: {
          Id: invite.OrganizationId
        }
      },
      UserRoles: {
        connectOrCreate: invite.Roles.map((r) => ({
          where: {
            UserId_RoleId_OrganizationId: {
              UserId: userId,
              RoleId: r,
              OrganizationId: invite.OrganizationId
            }
          },
          create: {
            RoleId: r,
            OrganizationId: invite.OrganizationId
          }
        }))
      },
      Groups: {
        connect: await prisma.groups.findMany({
          where: {
            OwnerId: invite.OrganizationId,
            Id: { in: invite.Groups }
          },
          select: {
            Id: true
          }
        })
      }
    }
  });

  await prisma.organizationMembershipInvites.update({
    where: {
      Token: invite.Token
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
