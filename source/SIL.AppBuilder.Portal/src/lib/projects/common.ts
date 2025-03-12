import { paginateSchema } from '$lib/table';
import { isAdminForOrg, isSuperAdmin } from '$lib/utils';
import { idSchema } from '$lib/valibot';
import type { Session } from '@auth/sveltekit';
import type { Prisma } from '@prisma/client';
import * as v from 'valibot';

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

//language tag regex sourced from: https://stackoverflow.com/a/60899733
export const langtagRegex = new RegExp(
  '^(' +
    '(' + // grandfathered
  /* irregular */ '(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)' +
    '|' +
  /* regular */ '(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)' +
    ')' +
    '|' + // langtag
    '(' +
    '(' +
    //language
    ('([A-Za-z]{2,3}(-' +
      //extlang
      '([A-Za-z]{3}(-[A-Za-z]{3}){0,2})' +
      ')?)|[A-Za-z]{4}|[A-Za-z]{5,8})') +
    '(-' +
    '([A-Za-z]{4})' +
    ')?' + //script
    '(-' +
    '([A-Za-z]{2}|[0-9]{3})' +
    ')?' + //region
    '(-' +
    '([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3})' +
    ')*' + //variant
    //extension
    '(-' +
    '(' +
  /* singleton */ ('[0-9A-WY-Za-wy-z]' + '(-[A-Za-z0-9]{2,8})+)') +
    ')*' +
    '(-' +
    '(x(-[A-Za-z0-9]{1,8})+)' +
    ')?' + //private use
    ')' +
    '|' +
    '(x(-[A-Za-z0-9]{1,8})+)' +
    ')$'
);

const projectSchemaBase = v.object({
  Name: v.pipe(v.string(), v.minLength(1)),
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

export const importJSONSchema = v.object({
  Projects: v.pipe(
    v.array(
      v.object({
        ...projectSchemaBase.entries,
        AllowDownloads: v.optional(v.boolean()),
        AutomaticBuilds: v.optional(v.boolean())
      })
    ),
    v.minLength(1)
  ),
  Products: v.pipe(
    v.array(
      v.object({
        Name: v.string(),
        Store: v.string()
      })
    ),
    v.minLength(1)
  )
});

export const projectActionSchema = v.object({
  operation: v.nullable(v.picklist(['archive', 'reactivate', 'claim'])),
  // used to distinguish between single and bulk. will be null if bulk
  projectId: v.nullable(idSchema),
  orgId: idSchema
});

export const bulkProjectActionSchema = v.object({
  ...projectActionSchema.entries,
  projects: v.array(idSchema)
});

export type ProjectActionSchema = typeof projectActionSchema;

export type ProjectForAction = {
  Id: number;
  Name: string | null;
  OwnerId: number;
  GroupId: number;
  DateArchived: Date | null;
};

export function canModifyProject(
  user: Session | null | undefined,
  projectOwnerId: number,
  organizationId: number
) {
  return projectOwnerId === user?.user.userId || isAdminForOrg(organizationId, user?.user.roles);
}

export function canClaimProject(
  session: Session | null | undefined,
  projectOwnerId: number,
  organizationId: number,
  projectGroupId: number,
  userGroupIds: number[]
) {
  if (session?.user.userId === projectOwnerId) return false;
  if (isSuperAdmin(session?.user.roles)) return true;
  return (
    canModifyProject(session, projectOwnerId, organizationId) &&
    userGroupIds.includes(projectGroupId)
  );
}

export function canArchive(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived'>,
  session: Session | null | undefined,
  orgId: number
): boolean {
  return !project.DateArchived && canModifyProject(session, project.OwnerId, orgId);
}

export function canReactivate(
  project: Pick<ProjectForAction, 'OwnerId' | 'DateArchived'>,
  session: Session | null | undefined,
  orgId: number
): boolean {
  return !!project.DateArchived && canModifyProject(session, project.OwnerId, orgId);
}
