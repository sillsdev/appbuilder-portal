import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';
import { RoleId } from '../public/prisma.js';

export async function setUserRolesForOrganization(
  userId: number,
  organizationId: number,
  roles: RoleId[]
) {
  const old = (
    await prisma.userRoles.findMany({
      where: {
        UserId: userId,
        OrganizationId: organizationId
      }
    })
  ).map((r) => r.RoleId);
  const remove = old.filter((role) => !roles.includes(role));
  const add = roles.filter((role) => !old.includes(role));
  await prisma.$transaction([
    prisma.userRoles.deleteMany({
      where: {
        UserId: userId,
        OrganizationId: organizationId,
        RoleId: {
          in: remove
        }
      }
    }),
    prisma.userRoles.createMany({
      data: add.map((r) => ({
        UserId: userId,
        OrganizationId: organizationId,
        RoleId: r
      }))
    })
  ]);
  if (remove.includes(RoleId.OrgAdmin) || add.includes(RoleId.OrgAdmin)) {
    const projects = (
      await prisma.projects.findMany({
        where: {
          OrganizationId: organizationId
        },
        select: {
          Id: true
        }
      })
    ).map((p) => p.Id);

    const del = remove.includes(RoleId.OrgAdmin);
    await Queues.UserTasks.addBulk(
      projects.map((pid) => ({
        name: `${del ? 'Remove' : 'Add'} OrgAdmin tasks for User #${userId} on Project #${pid}`,
        data: {
          type: BullMQ.JobType.UserTasks_Modify,
          scope: 'Project',
          projectId: pid,
          operation: {
            type: del ? BullMQ.UserTasks.OpType.Delete : BullMQ.UserTasks.OpType.Create,
            users: [userId],
            roles: [RoleId.OrgAdmin]
          }
        }
      }))
    );
  }
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
