import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';
import { RoleId } from '$lib/prisma';

/**
 * For a project to be valid:
 * 1. Each of the following must reference a valid relation (HANDLED BY POSTGRESQL)
 *  - OrganizationId => Organizations
 *  - GroupId => Groups
 *  - OwnerId => Users
 * 2. This project's group must have the same organization as the project itself
 *  - Group.OwnerId === OrganizationId
 * 3. The project's owner must be in the project's organization
 *  - Owner.OrganizationMemberships[].OrganizationId includes OrganizationId
 */

export async function create(
  projectData: RequirePrimitive<Prisma.ProjectsUncheckedCreateInput>
): Promise<boolean | number> {
  if (
    !(await validateProjectBase(
      projectData.OrganizationId,
      projectData.GroupId,
      projectData.OwnerId
    ))
  )
    return false;

  // No additional verification steps

  try {
    const res = await prisma.projects.create({
      data: projectData
    });
    return res.Id;
  } catch {
    return false;
  }
}

export async function update(
  id: number,
  projectData: RequirePrimitive<Prisma.ProjectsUncheckedUpdateInput>
): Promise<boolean> {
  // There are cases where a db lookup is not necessary to verify that it will
  // be a legal relation after the update, such as if none of the relevant
  // columns are changed, but for simplicity we just lookup once anyway
  const existing = await prisma.projects.findUnique({
    where: {
      Id: id
    }
  });
  const orgId = projectData.OrganizationId ?? existing!.OrganizationId;
  const groupId = projectData.GroupId ?? existing!.GroupId;
  const ownerId = projectData.OwnerId ?? existing!.OwnerId;
  if (!(await validateProjectBase(orgId, groupId, ownerId, id))) return false;

  // No additional verification steps

  try {
    await prisma.projects.update({
      where: {
        Id: id
      },
      data: projectData
    });
    // If the owner has changed, we need to reassign all the user tasks related to this project
    if (ownerId && ownerId !== existing?.OwnerId) {
      await getQueues().UserTasks.add(`Reassign tasks for Project #${id} (New Owner)`, {
        type: BullMQ.JobType.UserTasks_Workflow,
        scope: 'Project',
        projectId: id,
        operation: {
          type: BullMQ.UserTasks.OpType.Reassign,
          userMapping: [{ from: existing!.OwnerId, to: ownerId, withRole: RoleId.AppBuilder }]
        }
      });
    }
  } catch {
    return false;
  }
  getQueues().SvelteSSE.add(`Update Project #${id} (update details)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [id]
  });
  return true;
}

export async function createMany(projectData: RequirePrimitive<Prisma.ProjectsCreateManyInput>[]) {
  const valid = (
    await Promise.all(
      projectData.map((pd) => validateProjectBase(pd.OrganizationId, pd.GroupId, pd.OwnerId))
    )
  ).every((p) => p);

  try {
    if (valid) {
      return (
        await prisma.projects.createManyAndReturn({ data: projectData, select: { Id: true } })
      ).map((p) => p.Id);
    }
  } catch {
    return false;
  }

  return false;
}

// async function deleteProject(id: number): Promise<never> {
//   throw new Error('Should not be deleting a project, only archiving');
// }
// export { deleteProject as delete };

async function validateProjectBase(
  orgId: number,
  groupId: number,
  ownerId: number,
  projectId?: number
) {
  // Each of the criteria for a valid project just needs to checked if
  // the relevant data is supplied. If it isn't, then this is an update
  // and the data was valid already, or PostgreSQL will catch it
  const user = await prisma.users.findUnique({
    where: { Id: ownerId },
    select: {
      Groups: { where: { Id: groupId } },
      Organizations: { where: { Id: orgId } },
      UserRoles: { where: { RoleId: RoleId.SuperAdmin } }
    }
  });
  /** owner must be a member of project group */
  const userInGroup = !!user?.Groups.length;
  /** owner must be a member of project org */
  const userInOrg = !!user?.Organizations.length;
  /** disregard owner restrictions if owner is Super Admin */
  const userIsSuperAdmin = !!user?.UserRoles.length;

  /* project group must be owned by project org */
  const orgOwnsGroup =
    orgId === (await prisma.groups.findUnique({ where: { Id: groupId } }))?.OwnerId;

  const check = orgOwnsGroup && ((userInGroup && userInOrg) || userIsSuperAdmin);

  if (!check) {
    const span = trace.getActiveSpan();
    if (span) {
      const msg = `Project validation failed for ${projectId || 'new project'}`;
      span.addEvent(msg, {
        'project.organization-id': orgId,
        'project.group-id': groupId,
        'project.owner-id': ownerId,
        'project.group-in-org': orgOwnsGroup,
        'project.user-in-group': userInGroup,
        'project.user-in-org': userInOrg
      });

      span.recordException(new Error(msg));
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: msg
      });
    }
  }

  return check;
}

export async function getUsersByRole(projectId: number, roles?: RoleId[]) {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        {
          Projects: { some: { Id: projectId } }
        },
        {
          UserRoles: {
            some: {
              RoleId: RoleId.OrgAdmin,
              Organization: {
                Projects: {
                  some: { Id: projectId }
                }
              }
            }
          }
        },
        {
          Authors: { some: { ProjectId: projectId } }
        }
      ]
    },
    select: {
      Id: true,
      Projects: {
        where: {
          Id: projectId
        },
        select: {
          Id: true
        }
      },
      UserRoles: {
        where: {
          RoleId: RoleId.OrgAdmin,
          Organization: {
            Projects: {
              some: { Id: projectId }
            }
          }
        },
        select: {
          RoleId: true
        }
      },
      Authors: {
        where: {
          ProjectId: projectId
        },
        select: {
          UserId: true
        }
      }
    }
  });

  const includeOwner = !roles || roles.includes(RoleId.AppBuilder);
  const includeAdmin = !roles || roles.includes(RoleId.OrgAdmin);
  const includeAuthors = !roles || roles.includes(RoleId.Author);

  return new Map<number, Set<RoleId>>(
    (
      users.map((u) => [
        u.Id,
        new Set(
          [
            includeOwner && u.Projects.length && RoleId.AppBuilder,
            includeAdmin && u.UserRoles.length && RoleId.OrgAdmin,
            includeAuthors && u.Authors.length && RoleId.Author
          ].filter((r) => !!r)
        )
      ]) as [number, Set<RoleId>][]
    ).filter((u) => u[1].size)
  );
}
