import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Prisma } from '@prisma/client';
import { mapSystems } from '$lib/organizations/server';
import { DatabaseReads } from '$lib/server/database';
import type { RebuildableProductsData, UpdateSummaryData } from '$lib/software-updates';
import { filterAdminOrgs } from '$lib/utils/roles';
import { WorkflowState } from '$lib/workflowTypes';

const tracer = trace.getTracer('SoftwareUpdates');

export async function getUpdates(
  security: Security,
  orgIds?: number[]
): Promise<UpdateSummaryData[]> {
  return tracer.startActiveSpan('getUpdatesForOrgIds', async (span) => {
    span.setAttributes({
      'software-updates.orgIds': orgIds
    });
    try {
      const orgFilter: Prisma.OrganizationsWhereInput = {
        Id: orgIds ? { in: orgIds } : undefined,
        ...filterAdminOrgs(security)
      };
      const updates = await DatabaseReads.softwareUpdates.findMany({
        where: { UpdatedProducts: { some: { Product: { Project: { Organization: orgFilter } } } } },
        include: {
          InitiatedBy: {
            select: {
              Name: true
            }
          }
        }
      });

      const productFilter: Prisma.ProductsWhereInput = {
        SoftwareUpdates: { some: { SoftwareUpdateId: { in: updates.map((u) => u.Id) } } }
      };

      const orgs = await DatabaseReads.organizations.findMany({
        where: { ...orgFilter, Projects: { some: { Products: { some: productFilter } } } },
        select: {
          Id: true,
          Name: true,
          Projects: {
            where: {
              Products: { some: productFilter }
            },
            select: {
              Id: true,
              Name: true,
              TypeId: true,
              Products: {
                where: productFilter,
                select: {
                  Id: true,
                  ProductDefinitionId: true,
                  SoftwareUpdates: {
                    select: {
                      SoftwareUpdateId: true,
                      Version: true,
                      Status: true,
                      DateCompleted: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      const ret = updates.map((u) => {
        const count = { Completed: 0, Failed: 0, UpdatedProducts: 0 };
        return {
          ...u,
          Organizations: orgs
            .map((o) => {
              const presentAppTypes = new Map<number, Set<string>>();
              return {
                ...o,
                Projects: o.Projects.map((pj) => ({
                  ...pj,
                  Products: pj.Products.filter((p) =>
                    p.SoftwareUpdates.some((s) => s.SoftwareUpdateId === u.Id)
                  )
                    .map((p) => {
                      const update = p.SoftwareUpdates.filter(
                        (s) => s.SoftwareUpdateId === u.Id
                      ).at(0);
                      if (update) {
                        count.UpdatedProducts++;
                        if (update.DateCompleted) {
                          if (update.Status === WorkflowState.Published) {
                            count.Completed++;
                          } else {
                            count.Failed++;
                          }
                        }
                        if (!presentAppTypes.get(pj.TypeId)) {
                          presentAppTypes.set(pj.TypeId, new Set([update.Version]));
                        } else {
                          presentAppTypes.get(pj.TypeId)!.add(update.Version);
                        }
                        return {
                          ...p,
                          SoftwareUpdates: undefined,
                          ...update,
                          SoftwareUpdateId: undefined
                        };
                      } else {
                        return null;
                      }
                    })
                    .filter((p) => !!p)
                })).filter((pj) => pj.Products.length),
                Versions: Array.from(
                  presentAppTypes.entries().map(([ApplicationTypeId, Versions]) => ({
                    ApplicationTypeId,
                    Versions: Array.from(Versions)
                  }))
                )
              };
            })
            .filter((o) => o.Projects.length),
          _count: count
        };
      });

      span.addEvent('Software updates fetched', {
        updates: ret.length
      });

      return ret;
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (e as Error).message
      });
      throw e;
    } finally {
      span.end();
    }
  });
}

export const updatableProductsFilter = {
  // Products that are rebuildable:
  // - Have already been published once
  DatePublished: { not: null },
  // - Are not currently being rebuild
  WorkflowInstance: null,
  // - Have a definition that specifies a rebuild workflow
  NOT: {
    ProductDefinition: { RebuildWorkflow: null }
  }
} as const satisfies Prisma.ProductsWhereInput;

export async function getProducts(
  security: Security,
  orgIds?: number[]
): Promise<RebuildableProductsData> {
  const organizations = await DatabaseReads.organizations.findMany({
    where: {
      Projects: { some: { Products: { some: updatableProductsFilter } } },
      AND: [orgIds ? { Id: { in: orgIds } } : {}, filterAdminOrgs(security)]
    },
    select: {
      Id: true,
      Name: true,
      UseDefaultBuildEngine: true,
      System: {
        select: {
          SystemVersions: {
            select: {
              ApplicationTypeId: true,
              Version: true
            }
          }
        }
      },
      Projects: {
        where: {
          Products: { some: updatableProductsFilter }
        },
        select: {
          Id: true,
          Name: true,
          TypeId: true,
          Products: {
            where: updatableProductsFilter,
            select: {
              Id: true,
              ProductDefinitionId: true,
              ProductBuilds: {
                where: {
                  ProductPublications: { some: { Success: true } }
                },
                orderBy: { DateCreated: 'desc' },
                take: 1,
                select: { AppBuilderVersion: true }
              }
            }
          }
        }
      }
    }
  });

  const systems = await mapSystems(organizations);

  const presentAppTypes = new Set<number>();

  const withFilteredProducts = organizations
    .map((o) => ({
      Id: o.Id,
      Name: o.Name,
      Versions: o.System?.SystemVersions,
      Projects: o.Projects.map((pj) => ({
        ...pj,
        Products: pj.Products.filter((p) => {
          const targetVersion = systems.get(o.Id)?.get(pj.TypeId);
          const update = targetVersion && targetVersion !== p.ProductBuilds[0].AppBuilderVersion;
          if (update) {
            presentAppTypes.add(pj.TypeId);
          }
          return update;
        }).map((p) => ({
          Id: p.Id,
          ProductDefinitionId: p.ProductDefinitionId,
          OldVersion: p.ProductBuilds[0].AppBuilderVersion,
          Version: systems.get(o.Id)!.get(pj.TypeId)!
        }))
      })).filter((pj) => pj.Products.length)
    }))
    .filter((o) => o.Projects.length);

  return {
    organizations: withFilteredProducts,
    presentAppTypes
  };
}
