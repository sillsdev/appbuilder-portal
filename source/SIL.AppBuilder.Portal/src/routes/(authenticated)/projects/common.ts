import type { Prisma } from '@prisma/client';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';
import { paginateSchema } from '$lib/table';

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

export function projectFilter(args: {
  organizationId: number | null,
  langCode: string,
  productDefinitionId: number | null,
  dateUpdatedRange: [ Date, Date | null] | null,
  search: string
}): Prisma.ProjectsWhereInput {
  return {
    OrganizationId:
      args.organizationId !== null
        ? args.organizationId
        : undefined,
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