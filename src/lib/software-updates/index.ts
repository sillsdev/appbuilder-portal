import { SpanStatusCode, trace } from '@opentelemetry/api';
import { DatabaseReads } from '$lib/server/database';
import { filterAdminOrgs } from '$lib/utils/roles';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export interface RebuildItem {
  Id: number;
  InitiatedBy: string | null;
  Comment: string;
  DateCreated: Date | null;
  DateCompleted: Date | null;
  Organizations: string[];
  OrganizationIds: number[];
  Projects: {
    Id: number;
    Name: string;
  }[];
  _count: {
    Products: number;
    Projects: number;
  };
}
export type RebuildsTable = {
  complete: RebuildItem[];
  incomplete: RebuildItem[];
};

export async function getRebuilds(
  security: Security,
  orgIds: number[] | undefined
): Promise<RebuildsTable> {
  return tracer.startActiveSpan('getRebuildsForOrgIds', async (span) => {
    span.setAttributes({
      'software-updates.orgId': orgIds
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
                        Id: {
                          in: orgIds
                        },
                        ...filterAdminOrgs(security, undefined)
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
                        Id: {
                          in: orgIds
                        },
                        ...filterAdminOrgs(security, undefined)
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
                            Name: true,
                            Id: true
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
            const Projects = [...new Set(rebuild.Products.map((p) => p.Project))];
            const Organizations = [
              ...new Set(rebuild.Products.map((p) => p.Project.Organization.Name))
            ];
            const OrganizationIds = rebuild.Products.map((p) => p.Project.Organization.Id);
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
                Products: rebuild._count.Products,
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
