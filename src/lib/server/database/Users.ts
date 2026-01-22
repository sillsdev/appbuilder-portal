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

export async function acceptInvite(userId: number, inviteToken: string) {
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

export async function byExternalId(externalId: string) {
  return await prisma.users.findFirst({
    where: {
      ExternalId: externalId
    }
  });
}

