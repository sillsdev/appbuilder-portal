import type { Prisma } from '@prisma/client';

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
