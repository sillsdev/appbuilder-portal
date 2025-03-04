import type { Session } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { canClaimProject, canModifyProject, type ProjectForAction } from './common';

export async function verifyCanViewAndEdit(user: Session, projectId: number) {
  // Editing is allowed if the user owns the project, or if the user is an organization
  // admin for the project's organization, or if the user is a super admin
  const project = await prisma.projects.findUnique({
    where: {
      Id: projectId
    },
    select: {
      Id: true,
      OwnerId: true,
      OrganizationId: true
    }
  });
  if (!project) return false;
  return canModifyProject(user, project.OwnerId, project.OrganizationId);
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
            }
          ]
          : undefined
      }
    ]
  };
}
export async function verifyCanCreateProject(user: Session, orgId: number) {
  // Creating a project is allowed if the user is an OrgAdmin or AppBuilder for the organization or a SuperAdmin
  const roles = user.user.roles
    .filter(([org, role]) => org === orgId || role === RoleId.SuperAdmin)
    .map(([org, role]) => role);
  return (
    roles.includes(RoleId.AppBuilder) ||
    roles.includes(RoleId.OrgAdmin) ||
    roles.includes(RoleId.SuperAdmin)
  );
}

export async function userGroupsForOrg(userId: number, orgId: number) {
  return prisma.groupMemberships.findMany({
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
    // TODO: Delete UserTasks for Archived Project?
  } else if (operation === 'reactivate' && !!project?.DateArchived) {
    await DatabaseWrites.projects.update(project.Id, {
      DateArchived: null
    });
    // TODO: Create UserTasks for Reactivated Project?
  } else if (
    operation === 'claim' &&
    canClaimProject(session, project?.OwnerId, orgId, project?.GroupId, groups)
  ) {
    await DatabaseWrites.projects.update(project.Id, {
      OwnerId: session.user.userId
    });
  }
}
