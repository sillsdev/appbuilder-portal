import type { Prisma } from '@prisma/client';
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
  const org = await prisma.organizations.create({
    data
  });

  if (org && data.BuildEngineUrl && data.BuildEngineApiAccessToken) {
    await prisma.systemStatuses.create({
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
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.OrganizationsUncheckedUpdateInput>
) {
  if (data.BuildEngineApiAccessToken !== undefined || data.BuildEngineUrl !== undefined) {
    const existing = await prisma.systemStatuses.findFirst({
      where: { OrganizationId: id },
      select: {
        Id: true,
        BuildEngineUrl: true,
        BuildEngineApiAccessToken: true
      }
    });
    if (existing) {
      await prisma.systemStatuses.update({
        where: { Id: existing.Id },
        data: {
          BuildEngineUrl: data.BuildEngineUrl ?? undefined,
          BuildEngineApiAccessToken: data.BuildEngineApiAccessToken ?? undefined
        }
      });
    }
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

  return (
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
    }))
  );
}
