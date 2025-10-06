import type { Session } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import * as v from 'valibot';
import { RoleId } from '$lib/prisma';
import { hasRoleForOrg, isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
import { idSchema, langtagRegex, paginateSchema } from '$lib/valibot';

export function pruneProjects(
  projects: Prisma.ProjectsGetPayload<{
    include: {
      Products: {
        include: {
          ProductDefinition: true;
          WorkflowInstance: true;
        };
      };
      Owner: true;
      Group: true;
      Organization: true;
    };
  }>[]
) {
  return projects.map(
    ({
      Name,
      Id,
      Language,
      Owner: { Name: OwnerName, Id: OwnerId },
      Organization: { Name: OrganizationName },
      Group: { Name: GroupName, Id: GroupId },
      DateActive,
      DateUpdated,
      DateArchived,
      Products
    }) => ({
      Name,
      Id,
      Language,
      OwnerId,
      OwnerName,
      OrganizationName,
      GroupName,
      GroupId,
      DateUpdated,
      DateActive,
      DateArchived,
      Products: Products.map(
        ({ Id, ProductDefinition, VersionBuilt, DateBuilt, WorkflowInstance, DatePublished }) => ({
          Id: Id,
          ProductDefinitionId: ProductDefinition.Id,
          ProductDefinitionName: ProductDefinition.Name,
          VersionBuilt,
          DateBuilt,
          CanRebuild: !!(
            !WorkflowInstance &&
            DatePublished &&
            ProductDefinition.RebuildWorkflowId !== null
          ),
          CanRepublish: !!(
            !WorkflowInstance &&
            DatePublished &&
            ProductDefinition.RepublishWorkflowId !== null
          )
        })
      )
    })
  );
}

export type PrunedProject = ReturnType<typeof pruneProjects>[0];

export const projectSearchSchema = v.object({
  organizationId: v.nullable(idSchema),
  langCode: v.string(),
  productDefinitionId: v.nullable(idSchema),
  dateUpdatedRange: v.nullable(v.tuple([v.date(), v.nullable(v.date())])),
  page: paginateSchema,
  search: v.string()
});

const projectSchemaBase = v.object({
  Name: v.pipe(v.string(), v.minLength(1), v.trim()),
  Description: v.optional(v.string()),
  Language: v.pipe(
    v.string(),
    v.regex(langtagRegex, (issue) => `Invalid BCP 47 Language Tag: ${issue.input}`)
  ),
  IsPublic: v.boolean()
});

export const projectCreateSchema = v.object({
  ...projectSchemaBase.entries,
  group: idSchema,
  type: idSchema
});

export const importJSONSchema = v.pipe(
  v.string(),
  // make sure it is valid JSON
  v.rawTransform(({ dataset, addIssue, NEVER }) => {
    try {
      return JSON.parse(dataset.value || '{}');
    } catch (e) {
      addIssue({
        message: e instanceof Error ? e.message : String(e),
        path: [
          {
            type: 'unknown',
            origin: 'value',
            input: dataset.value,
            key: 'root',
            value: dataset.value
          }
        ]
      });
      return NEVER;
    }
  }),
  // make sure it has the right structure
  v.strictObject({
    Projects: v.pipe(
      v.array(
        v.strictObject({
          ...projectSchemaBase.entries,
          AllowDownloads: v.optional(v.boolean())
          // ISSUE #1303 Add new fields here
        })
      ),
      v.minLength(1)
    ),
    Products: v.pipe(
      v.array(
        v.strictObject({
          Name: v.string(),
          Store: v.string()
        })
      ),
      v.minLength(1)
    )
  })
);

export const projectActionSchema = v.object({
  operation: v.nullable(v.picklist(['archive', 'reactivate', 'claim'])),
  // used to distinguish between single and bulk. will be null if bulk
  projectId: v.nullable(idSchema)
});

export const bulkProjectActionSchema = v.object({
  ...projectActionSchema.entries,
  projects: v.array(idSchema)
});

export type ProjectActionSchema = typeof projectActionSchema;

export type ProjectForAction = Prisma.ProjectsGetPayload<{
  select: {
    Id: true;
    Name: true;
    OwnerId: true;
    GroupId: true;
    DateArchived: true;
  };
}>;

export type MaybeSession = Pick<Session, 'user'> | null | undefined;

/**
 * User can modify a project (excluding ownership) iff:
 * The user is the owner or is an admin for the org
 */
export function canModifyProject(
  user: MaybeSession,
  projectOwnerId: number,
  organizationId: number
): boolean {
  return (
    !!user &&
    (projectOwnerId === user?.user.userId || isAdminForOrg(organizationId, user?.user.roles))
  );
}

/**
 * User can claim a project iff:
 * They are not the owner and are in the same group and have the AppBuilder or OrgAdmin roles (ignored if superAdmin)
 */
export function canClaimProject(
  session: MaybeSession,
  projectOwnerId: number,
  organizationId: number,
  projectGroupId: number,
  userGroupIds: number[]
) {
  return (
    session?.user.userId !== projectOwnerId && // user is not the owner AND
    (isSuperAdmin(session?.user.roles) || // short circuit if superadmin
      ((isAdminForOrg(organizationId, session?.user.roles) || // (user is admin OR
        hasRoleForOrg(RoleId.AppBuilder, organizationId, session?.user.roles)) && // user is AppBuilder) AND
        userGroupIds.includes(projectGroupId))) // user is in the group
  );
}

export function canArchive(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived'>,
  session: MaybeSession,
  orgId: number
): boolean {
  return !project.DateArchived && canModifyProject(session, project.OwnerId, orgId);
}

export function canReactivate(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived'>,
  session: MaybeSession,
  orgId: number
): boolean {
  return !!project.DateArchived && canModifyProject(session, project.OwnerId, orgId);
}
