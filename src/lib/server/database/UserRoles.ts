import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import { RoleId } from '$lib/prisma';

export async function toggleForOrg(
  OrganizationId: number,
  UserId: number,
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
  // ISSUE: #1102 this extra check would be unneccessary if we could switch to composite primary keys
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
          type: BullMQ.JobType.UserTasks_Modify,
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

export async function allUsersByRole(
  projectId: number,
  roles?: RoleId[]
): Promise<Record<number, Set<RoleId>>> {
  const project = await prisma.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      OrganizationId: true,
      OwnerId: !roles || roles.includes(RoleId.AppBuilder),
      Authors:
        !roles || roles.includes(RoleId.Author)
          ? {
              select: {
                UserId: true
              }
            }
          : undefined
    }
  });

  if (!project) return {};

  const admins =
    !roles || roles.includes(RoleId.OrgAdmin)
      ? await prisma.userRoles.findMany({
          where: {
            OrganizationId: project.OrganizationId,
            RoleId: RoleId.OrgAdmin
          },
          select: {
            UserId: true
          }
        })
      : [];

  const ret: Record<number, Set<RoleId>> = {};

  if (!roles || roles.includes(RoleId.OrgAdmin)) {
    admins.forEach((u) => {
      ret[u.UserId] = new Set([RoleId.OrgAdmin]);
    });
  }
  if (!roles || roles.includes(RoleId.Author)) {
    project.Authors.forEach((u) => {
      if (u.UserId in ret) {
        ret[u.UserId].add(RoleId.Author);
      } else {
        ret[u.UserId] = new Set([RoleId.Author]);
      }
    });
  }
  if (!roles || roles.includes(RoleId.AppBuilder)) {
    if (project.OwnerId in ret) {
      ret[project.OwnerId].add(RoleId.AppBuilder);
    } else {
      ret[project.OwnerId] = new Set([RoleId.AppBuilder]);
    }
  }
  return ret;
}
