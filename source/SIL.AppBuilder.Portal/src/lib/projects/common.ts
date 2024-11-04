import { paginateSchema } from '$lib/table';
import { idSchema } from '$lib/valibot';
import type { Prisma } from '@prisma/client';
import * as v from 'valibot';

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
      Owner: { Name: OwnerName },
      Organization: { Name: OrganizationName },
      Group: { Name: GroupName },
      DateActive,
      DateUpdated,
      Products
    }) => ({
      Name,
      Id,
      Language,
      OwnerName,
      OrganizationName,
      GroupName,
      DateUpdated,
      DateActive,
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

export const projectSearchSchema = v.object({
  organizationId: v.nullable(idSchema),
  langCode: v.string(),
  productDefinitionId: v.nullable(idSchema),
  dateUpdatedRange: v.nullable(v.tuple([v.date(), v.nullable(v.date())])),
  page: paginateSchema,
  search: v.string()
});

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
