import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function createInvite(
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

export async function create(data: RequirePrimitive<Prisma.OrganizationsUncheckedCreateInput>) {
  return await prisma.$transaction(async (tx) => {
    const org = await tx.organizations.create({
      data
    });

    if (org && data.BuildEngineUrl && data.BuildEngineApiAccessToken) {
      await tx.systemStatuses.create({
        data: {
          BuildEngineUrl: data.BuildEngineUrl,
          BuildEngineApiAccessToken: data.BuildEngineApiAccessToken,
          SystemAvailable: false,
          OrganizationId: org.Id
        },
        select: {
          Id: true
        }
      });
    }

    return org;
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.OrganizationsUncheckedUpdateInput>
) {
  if (data.BuildEngineApiAccessToken !== undefined || data.BuildEngineUrl !== undefined) {
    await prisma.systemStatuses.upsert({
      where: { OrganizationId: id },
      update: {
        BuildEngineUrl: data.BuildEngineUrl ?? undefined,
        BuildEngineApiAccessToken: data.BuildEngineApiAccessToken ?? undefined
      },
      create: {
        OrganizationId: id,
        SystemAvailable: false,
        BuildEngineUrl: data.BuildEngineUrl ?? '',
        BuildEngineApiAccessToken: data.BuildEngineApiAccessToken ?? ''
      }
    });
  }
  return await prisma.organizations.update({
    where: { Id: id },
    data
  });
}

export async function toggleUser(OrganizationId: number, UserId: number, enabled: boolean) {
  // check if user owns a project in the org
  const userHasProjectInOrg = await prisma.projects.findFirst({
    where: { OwnerId: UserId, OrganizationId },
    select: { Id: true }
  });

  const updated =
    (enabled || !userHasProjectInOrg) &&
    !!(await prisma.users.update({
      where: { Id: UserId },
      data: {
        Organizations: {
          [enabled ? 'connect' : 'disconnect']: {
            Id: OrganizationId
          }
        }
      },
      select: {
        Id: true
      }
    }));

  if (updated) {
    // remove user from groups/roles too
    if (!enabled) {
      await prisma.users.update({
        where: { Id: UserId },
        data: {
          Groups: {
            disconnect: await prisma.groups.findMany({
              where: { OwnerId: OrganizationId, Users: { some: { Id: UserId } } },
              select: { Id: true }
            })
          },
          UserRoles: {
            deleteMany: {
              OrganizationId
            }
          }
        }
      });
    }
    await getQueues().SvelteSSE.add(
      `Update Projects for Org #${OrganizationId} (user #${UserId} ${enabled ? 'added' : 'removed'})`,
      {
        type: BullMQ.JobType.SvelteSSE_UpdateProjectGroups,
        projectIds: (
          await prisma.projects.findMany({
            where: { OrganizationId },
            select: { Id: true }
          })
        ).map((p) => p.Id)
      }
    );
  }

  return updated;
}
