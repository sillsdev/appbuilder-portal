import type { Prisma } from '@prisma/client';
import { RoleId } from '$lib/prisma';
import { type ProjectForAction, canClaimProject } from '$lib/projects';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { isAdminForOrg } from '$lib/utils/roles';

export function projectFilter(args: {
  organizationId: number | null;
  langCode: string;
  productDefinitionId: number | null;
  dateUpdatedRange: [Date, Date | null] | null;
  search: string;
}) {
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
  } satisfies Prisma.ProjectsWhereInput;
}

export function verifyCanCreateProject(user: Security, orgId: number): boolean {
  // Creating a project is allowed if the user is an OrgAdmin or AppBuilder for the organization or a SuperAdmin
  return (
    isAdminForOrg(orgId, user.sessionForm.roles) ||
    !!user.roles.get(orgId)?.includes(RoleId.AppBuilder)
  );
}

export async function userGroupsForOrg(userId: number, orgId: number) {
  return await DatabaseReads.groups.findMany({
    where: {
      Users: { some: { Id: userId } },
      OwnerId: orgId
    },
    select: {
      Id: true
    }
  });
}

export async function doProjectAction(
  operation: string | null,
  project: Omit<ProjectForAction, 'Name'>,
  security: Security,
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
    canClaimProject(
      security.sessionForm,
      project?.OwnerId,
      project.OrganizationId,
      project?.GroupId,
      groups
    )
  ) {
    await DatabaseWrites.projects.update(project.Id, {
      OwnerId: security.userId
    });
  }
}

export function projectUrl(id: number) {
  const originUrl = process.env.ORIGIN || 'http://localhost:6173';
  return originUrl + '/projects/' + id;
}
