import type { Session } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import * as v from 'valibot';
import { RoleId } from '$lib/prisma';
import { isAdminForOrg } from '$lib/utils/roles';
import { idSchema, langtagRegex, paginateSchema } from '$lib/valibot';

export function pruneProjects(
  projects: Prisma.ProjectsGetPayload<{
    include: {
      Products: {
        include: {
          ProductDefinition: true;
          WorkflowInstance: true;
          ProductBuilds: true;
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
      Organization: { Name: OrganizationName, Id: OrganizationId },
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
      OrganizationId,
      GroupName,
      GroupId,
      DateUpdated,
      DateActive,
      DateArchived,
      Products: Products.map(
        ({
          Id,
          ProductDefinition,
          VersionBuilt,
          DateBuilt,
          WorkflowInstance,
          DatePublished,
          ProductBuilds
        }) => ({
          Id: Id,
          ProductDefinitionId: ProductDefinition.Id,
          ProductDefinitionName: ProductDefinition.Name,
          VersionBuilt,
          AppBuilderVersion: ProductBuilds.at(0)?.AppBuilderVersion ?? null,
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
          AllowDownloads: v.optional(v.boolean()),
          AutoPublishOnRebuild: v.optional(v.boolean()),
          RebuildOnSoftwareUpdate: v.optional(v.boolean())
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

export type ProjectImportJSON = v.InferOutput<typeof importJSONSchema>;

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
    OrganizationId: true;
  };
}>;

/**
 * User can modify a project (excluding ownership) iff:
 * The user is the owner or is an admin for the org
 */
export function canModifyProject(
  security: Session['user'],
  projectOwnerId: number,
  organizationId: number
): boolean {
  return (
    !!security &&
    (projectOwnerId === security.userId || isAdminForOrg(organizationId, security.roles))
  );
}

/**
 * User can claim a project iff:
 * They are not the owner and are in the same group and have the AppBuilder or OrgAdmin roles (ignored if superAdmin)
 */
export function canClaimProject(
  security: Session['user'],
  projectOwnerId: number,
  organizationId: number,
  projectGroupId: number,
  userGroupIds: number[]
) {
  if (security.userId === projectOwnerId) return false;
  if (security.roles.some(([, r]) => r === RoleId.SuperAdmin)) return true;
  return (
    canModifyProject(security, projectOwnerId, organizationId) ||
    (userGroupIds.includes(projectGroupId) &&
      security.roles.some(([, r]) => r === RoleId.AppBuilder))
  );
}

export function canArchive(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived' | 'OrganizationId'>,
  security: Session['user']
): boolean {
  return (
    !project.DateArchived && canModifyProject(security, project.OwnerId, project.OrganizationId)
  );
}

export function canReactivate(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived' | 'OrganizationId'>,
  security: Session['user']
): boolean {
  return (
    !!project.DateArchived && canModifyProject(security, project.OwnerId, project.OrganizationId)
  );
}
