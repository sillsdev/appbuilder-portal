import type { Prisma } from '@prisma/client';
import { ProjectActionString, ProjectActionType, RoleId } from '$lib/prisma';
import { type ProjectForAction, type ProjectSearch, canClaimProject } from '$lib/projects';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { isAdminForOrg } from '$lib/utils/roles';

export function projectFilter(args: ProjectSearch) {
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
    TypeId: args.appType ? args.appType : undefined,
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
  console.log(`doProjectAction: ${operation}`);
  if (
    operation === 'claim' &&
    canClaimProject(
      security.sessionForm,
      project.OwnerId,
      project.OrganizationId,
      project.GroupId,
      groups
    )
  ) {
    const success = await DatabaseWrites.projects.update(project.Id, {
      OwnerId: security.userId
    });
    if (success) {
      await DatabaseWrites.projectActions.create({
        ProjectId: project.Id,
        UserId: security.userId,
        ActionType: ProjectActionType.OwnerGroup,
        Action: ProjectActionString.Claim,
        ExternalId: security.userId
      });
    }
  } else if (project.DateArchived ? operation === 'reactivate' : operation === 'archive') {
    const archiving = operation === 'archive';
    const timestamp = new Date();
    await DatabaseWrites.projects.update(project.Id, {
      DateArchived: archiving ? timestamp : null
    });
    await DatabaseWrites.projectActions.create({
      ProjectId: project.Id,
      UserId: security.userId,
      DateAction: timestamp,
      ActionType: ProjectActionType.Archival,
      Action: archiving ? ProjectActionString.Archive : ProjectActionString.Reactivate
    });
    await getQueues().UserTasks.add(
      `${archiving ? 'Delete' : 'Create'} UserTasks for ${archiving ? 'Archived' : 'Reactivated'} Project #${project.Id}`,
      {
        type: BullMQ.JobType.UserTasks_Workflow,
        scope: 'Project',
        projectId: project.Id,
        operation: {
          type: archiving ? BullMQ.UserTasks.OpType.Delete : BullMQ.UserTasks.OpType.Create
        }
      }
    );
  }
}

export function projectUrl(id: number) {
  const originUrl = process.env.ORIGIN || 'http://localhost:6173';
  return originUrl + '/projects/' + id;
}
