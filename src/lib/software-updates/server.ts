import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Prisma } from '@prisma/client';
import { DatabaseReads } from '$lib/server/database';
import type { UpdateSummaryData } from '$lib/software-updates';
import { filterAdminOrgs } from '$lib/utils/roles';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export async function getUpdates(
  security: Security,
  orgIds?: number[]
): Promise<UpdateSummaryData[]> {
  return tracer.startActiveSpan('getRebuildsForOrgIds', async (span) => {
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
        where: { Projects: { some: { Products: { some: productFilter } } } },
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

      const ret = updates.map((u) => {
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
                      const update = p.SoftwareUpdates.filter(
                        (s) => s.SoftwareUpdateId === u.Id
                      ).at(0);
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
                  presentAppTypes.entries().map(([ApplicationTypeId, Version]) => ({
                    ApplicationTypeId,
                    Versions: [Version]
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
