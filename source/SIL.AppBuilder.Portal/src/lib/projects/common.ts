import type { Prisma } from '@prisma/client';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';
import type { Session } from '@auth/sveltekit';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';

export function pruneProjects(
  projects: Prisma.ProjectsGetPayload<{
    include: {
      Products: {
        include: {
          ProductDefinition: true;
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
      Group: { Name: GroupName },
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
      DateUpdated,
      DateActive,
      DateArchived,
      Products: Products.map(
        ({ ProductDefinition: { Name: ProductDefinitionName }, VersionBuilt, DateBuilt }) => ({
          ProductDefinitionName,
          VersionBuilt,
          DateBuilt
        })
      )
    })
  );
}

export type PrunedProject = ReturnType<typeof pruneProjects>[0];

const projectSchemaBase = v.object({
  Name: v.pipe(v.string(), v.minLength(1)),
  Description: v.optional(v.string()),
  Language: v.pipe(v.string(), v.minLength(1)),
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

export function canModifyProject(user: Session, projectOwnerId: number, organizationId: number) {
  if (projectOwnerId === user.user.userId) return true;
  if (
    user.user.roles.find(
      (r) => r[1] === RoleId.SuperAdmin || (r[1] === RoleId.OrgAdmin && r[0] === organizationId)
    )
  )
    return true;
  return false;
}
