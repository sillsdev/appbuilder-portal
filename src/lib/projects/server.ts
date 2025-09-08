import type { Session } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import { RoleId } from '$lib/prisma';
import { type ProjectForAction, canClaimProject, canModifyProject } from '$lib/projects';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { ServerStatus } from '$lib/utils';
import { hasRoleForOrg, isAdminForOrg } from '$lib/utils/roles';

export async function verifyCanViewAndEdit(
  user: Session,
  projectId: number
): Promise<ServerStatus> {
  // Editing is allowed if the user owns the project, or if the user is an organization
  // admin for the project's organization, or if the user is a super admin
  if (isNaN(projectId)) return ServerStatus.NotFound;
  const project = await DatabaseReads.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      Id: true,
      OwnerId: true,
      OrganizationId: true
    }
  });
  if (!project) return ServerStatus.NotFound;
  return canModifyProject(user, project.OwnerId, project.OrganizationId)
    ? ServerStatus.Ok
    : ServerStatus.Forbidden;
}

export function projectFilter(args: {
  organizationId: number | null;
  langCode: string;
  productDefinitionId: number | null;
  dateUpdatedRange: [Date, Date | null] | null;
  search: string;
}): Prisma.ProjectsWhereInput {
  return {
    OrganizationId: args.organizationId !== null ? args.organizationId : undefined,
    Language: args.langCode
      ? {
          contains: args.langCode,
          mode: 'insensitive'
        }
      : undefined,
    Products:
      args.productDefinitionId !== null
        ? {
            some: {
              ProductDefinitionId: args.productDefinitionId
            }
          }
        : undefined,
    AND: [
      {
        OR:
          args.dateUpdatedRange && args.dateUpdatedRange[1]
            ? [
                { DateUpdated: null },
                {
                  DateUpdated: {
                    gt: args.dateUpdatedRange[0],
                    lt: args.dateUpdatedRange[1]
                  }
                }
              ]
            : undefined
      },
      {
        OR: args.search
          ? [
              {
                Name: {
                  contains: args.search,
                  mode: 'insensitive'
                }
              },
              {
                Language: {
                  contains: args.search,
                  mode: 'insensitive'
                }
              },
              {
                Owner: {
                  Name: {
                    contains: args.search,
                    mode: 'insensitive'
                  }
                }
              },
              {
                Organization: {
                  Name: {
                    contains: args.search,
                    mode: 'insensitive'
                  }
                }
              },
              {
                Group: {
                  Name: {
                    contains: args.search,
                    mode: 'insensitive'
                  }
                }
              },
              {
                Products: {
                  some: {
                    PackageName: {
                      contains: args.search,
                      mode: 'insensitive'
                    }
                  }
                }
              }
            ]
          : undefined
      }
    ]
  };
}
export function verifyCanCreateProject(user: Session, orgId: number): boolean {
  // Creating a project is allowed if the user is an OrgAdmin or AppBuilder for the organization or a SuperAdmin
  return (
    isAdminForOrg(orgId, user.user.roles) ||
    hasRoleForOrg(RoleId.AppBuilder, orgId, user.user.roles)
  );
}

export async function userGroupsForOrg(userId: number, orgId: number) {
  return await DatabaseReads.groupMemberships.findMany({
    where: {
      UserId: userId,
      Group: {
        is: {
          OwnerId: orgId
        }
      }
    },
    select: {
      GroupId: true
    }
  });
}

export async function doProjectAction(
  operation: string | null,
  project: Omit<ProjectForAction, 'Name'>,
  session: Session,
  orgId: number,
  groups: number[]
) {
  if (operation === 'archive' && !project?.DateArchived) {
    await DatabaseWrites.projects.update(project.Id, {
      DateArchived: new Date()
    });
    await getQueues().UserTasks.add(`Delete UserTasks for Archived Project #${project.Id}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Project',
      projectId: project.Id,
      operation: {
        type: BullMQ.UserTasks.OpType.Delete
      }
    });
  } else if (operation === 'reactivate' && !!project?.DateArchived) {
    await DatabaseWrites.projects.update(project.Id, {
      DateArchived: null
    });
    await getQueues().UserTasks.add(`Create UserTasks for Reactivated Project #${project.Id}`, {
      type: BullMQ.JobType.UserTasks_Modify,
      scope: 'Project',
      projectId: project.Id,
      operation: {
        type: BullMQ.UserTasks.OpType.Create
      }
    });
  } else if (
    operation === 'claim' &&
    canClaimProject(session, project?.OwnerId, orgId, project?.GroupId, groups)
  ) {
    await DatabaseWrites.projects.update(project.Id, {
      OwnerId: session.user.userId
    });
  }
}
