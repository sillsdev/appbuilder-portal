import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Prisma } from '@prisma/client';
import { DatabaseReads } from '$lib/server/database';
import type { RebuildsTable, UpdateSummaryData } from '$lib/software-updates';
import { filterAdminOrgs } from '$lib/utils/roles';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export async function getRebuilds(security: Security, orgIds?: number[]): Promise<RebuildsTable> {
  return tracer.startActiveSpan('getRebuildsForOrgIds', async (span) => {
    span.setAttributes({
      'software-updates.orgIds': orgIds
    });
    try {
      const rebuilds = {
        // ensure fields exist
        complete: [],
        incomplete: [],
        ...Object.groupBy(
          (
            await DatabaseReads.softwareUpdates.findMany({
              where: {
                UpdatedProducts: {
                  some: {
                    Product: {
                      Project: {
                        Organization: {
                          Id: orgIds
                            ? {
                                in: orgIds
                              }
                            : undefined,
                          ...filterAdminOrgs(security)
                        }
                      }
                    }
                  }
                }
              },

              orderBy: {
                DateCreated: 'desc'
              },

              select: {
                Id: true,
                Comment: true,
                DateCreated: true,
                DateCompleted: true,
                Paused: true,
                InitiatedBy: {
                  select: {
                    Name: true
                  }
                },

                UpdatedProducts: {
                  where: {
                    Product: {
                      Project: {
                        Organization: {
                          Id: orgIds
                            ? {
                                in: orgIds
                              }
                            : undefined,
                          ...filterAdminOrgs(security, undefined)
                        }
                      }
                    }
                  },
                  orderBy: {
                    Product: {
                      Project: {
                        Name: 'desc'
                      }
                    }
                  },
                  select: {
                    Product: {
                      select: {
                        Id: true,
                        Project: {
                          select: {
                            Id: true,
                            Name: true,
                            TypeId: true,
                            Organization: {
                              select: {
                                Name: true,
                                Id: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },

                _count: {
                  select: {
                    UpdatedProducts: true
                  }
                }
              }
            })
          ).map((rebuild) => {
            // Data I care about:
            // - Number of products
            // - Number of projects
            // - Organization name(s)
            // - Date started
            // - Date completed
            // - Initiating user

            // TODO Figure out what to do about projects across orgs with the same name
            const Projects = [...new Set(rebuild.UpdatedProducts.map((p) => p.Product.Project))];
            const Organizations = [
              ...new Set(rebuild.UpdatedProducts.map((p) => p.Product.Project.Organization.Name))
            ];
            const OrganizationIds = rebuild.UpdatedProducts.map(
              (p) => p.Product.Project.Organization.Id
            );
            return {
              Id: rebuild.Id,
              InitiatedBy: rebuild.InitiatedBy.Name,
              DateCreated: rebuild.DateCreated,
              DateCompleted: rebuild.DateCompleted,
              Organizations,
              OrganizationIds,
              Comment: rebuild.Comment,
              Projects,
              _count: {
                Products: rebuild._count.UpdatedProducts,
                Projects: Projects.length
              }
            };
          }),
          ({ DateCompleted }) => (DateCompleted ? 'complete' : 'incomplete')
        )
      };

      span.addEvent('Software updates fetched', {
        'rebuilds.complete.length': rebuilds.complete.length,
        'rebuilds.incomplete.length': rebuilds.incomplete.length
      });

      return rebuilds;
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

export async function getUpdates(
  security: Security,
  orgIds?: number[]
): Promise<UpdateSummaryData[]> {
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
    where: { Projects: { some: { Products: { some: productFilter } } } },
    select: {
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
                  Success: true,
                  DateCompleted: true
                }
              }
            }
          }
        }
      }
    }
  });

  return updates.map((u) => {
    const count = { Completed: 0, Failed: 0, UpdatedProducts: 0 };
    return {
      ...u,
      Organizations: orgs
        .map((o) => {
          const presentAppTypes = new Map<number, string>();
          return {
            ...o,
            Projects: o.Projects.map((pj) => ({
              ...pj,
              Products: pj.Products.filter((p) =>
                p.SoftwareUpdates.some((s) => s.SoftwareUpdateId === u.Id)
              )
                .map((p) => {
                  const update = p.SoftwareUpdates.filter((s) => s.SoftwareUpdateId === u.Id).at(0);
                  if (update) {
                    count.UpdatedProducts++;
                    if (update.DateCompleted) {
                      if (update.Success) {
                        count.Completed++;
                      } else {
                        count.Failed++;
                      }
                    }
                    if (!presentAppTypes.get(pj.TypeId)) {
                      presentAppTypes.set(pj.TypeId, update.Version);
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
              presentAppTypes
                .entries()
                .map(([ApplicationTypeId, Version]) => ({ ApplicationTypeId, Versions: [Version] }))
            )
          };
        })
        .filter((o) => o.Projects.length),
      _count: count
    };
  });
}
