import { SpanStatusCode, trace } from '@opentelemetry/api';
import { DatabaseReads } from '$lib/server/database';
import { filterAdminOrgs } from '$lib/utils/roles';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export interface RebuildItem {
  InitiatedBy: string | null;
  DateCreated: Date | null;
  DateCompleted: Date | null;
  Organizations: string[];
  Projects: string[];
  _count: {
    Products: number;
    Projects: number;
  };
}
export type RebuildsTable = {
  complete: RebuildItem[];
  incomplete: RebuildItem[];
};

export async function getRebuilds(security: Security, orgId: number): Promise<RebuildsTable> {
  return tracer.startActiveSpan('getRebuildsForOrgIds', async (span) => {
    span.setAttributes({
      'software-updates.orgId': orgId
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
                Products: {
                  some: {
                    Project: {
                      Organization: {
                        ...filterAdminOrgs(security, orgId)
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

                Products: {
                  where: {
                    Project: {
                      Organization: {
                        ...filterAdminOrgs(security, orgId)
                      }
                    }
                  },
                  orderBy: {
                    Project: {
                      Name: 'desc'
                    }
                  },
                  select: {
                    Id: true,
                    Project: {
                      select: {
                        Id: true,
                        Name: true,
                        Organization: {
                          select: {
                            Name: true
                          }
                        }
                      }
                    }
                  }
                },
                _count: {
                  select: {
                    Products: true
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
            const projects = [...new Set(rebuild.Products.map((p) => p.Project))];
            const organizations = [
              ...new Set(rebuild.Products.map((p) => p.Project.Organization.Name))
            ];
            return {
              InitiatedBy: rebuild.InitiatedBy.Name,
              DateCreated: rebuild.DateCreated,
              DateCompleted: rebuild.DateCompleted,
              Organizations: organizations,
              Projects: projects,
              _count: {
                Products: rebuild._count.Products,
                Projects: projects.length
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
