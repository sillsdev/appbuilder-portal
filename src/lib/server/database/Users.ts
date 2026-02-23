import type { Profile } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';
import { RoleId } from '$lib/prisma';

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

export async function toggleRole(
  UserId: number,
  OrganizationId: number,
  role: RoleId,
  enabled: boolean
) {
  // check if user is a member of the org
  if (
    !(await prisma.users.findFirst({
      where: { Organizations: { some: { Id: OrganizationId } }, Id: UserId }
    }))
  )
    return false;
  // This existence check is necessary for the task creation step
  const existing = await prisma.userRoles.findFirst({
    where: { OrganizationId, UserId, RoleId: role },
    select: { RoleId: true }
  });
  if (enabled) {
    if (!existing) {
      await prisma.userRoles.create({
        data: { OrganizationId, UserId, RoleId: role }
      });
    }
  } else {
    await prisma.userRoles.deleteMany({
      where: { OrganizationId, UserId, RoleId: role }
    });
  }

  /*
   * Only enqueue tasks when:
   * 1. The role is OrgAdmin AND
   * 2. Either we're adding a role that hasn't already been added or removing a role.
   * This prevents duplicate task enqueuing when adding an already-added role
   */
  if (role === RoleId.OrgAdmin && !(enabled && existing)) {
    await getQueues().UserTasks.addBulk(
      (
        await prisma.projects.findMany({
          where: { OrganizationId },
          select: { Id: true }
        })
      ).map((p) => ({
        name: `${enabled ? 'Add' : 'Remove'} OrgAdmin tasks for User #${UserId} on Project #${p.Id}`,
        data: {
          type: BullMQ.JobType.UserTasks_Workflow,
          scope: 'Project',
          projectId: p.Id,
          operation: {
            type: enabled ? BullMQ.UserTasks.OpType.Create : BullMQ.UserTasks.OpType.Delete,
            users: [UserId],
            roles: [RoleId.OrgAdmin]
          }
        }
      }))
    );
  }
  return true;
}

// Make sure that group belongs to organization the user is in
// and removed group is not linked to projects this user owns
export async function toggleGroup(
  UserId: number,
  OrganizationId: number,
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
