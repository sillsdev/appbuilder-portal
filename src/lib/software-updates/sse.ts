import { SpanStatusCode, trace } from '@opentelemetry/api';
import { DatabaseReads } from '$lib/server/database';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export async function getRebuildsForOrgIds(orgIds: number[]) {
  return tracer.startActiveSpan('getRebuildsForOrgIds', async (span) => {
    span.setAttributes({
      'software-updates.orgIds': orgIds.length,
      'software-updates.orgIdsList': orgIds.join(',')
    });
    try {
      if (!orgIds.length) {
        span.addEvent('No organization IDs provided');
        return { rebuilds: [], projectIds: [] };
      }
      // First fetch projects for the organizations to determine which software updates are relevant.
      const orgProjects = await DatabaseReads.projects.findMany({
        where: { OrganizationId: { in: orgIds } },
        select: { Id: true }
      });

      const projectIds = orgProjects.map((p) => p.Id);
      span.addEvent('Projects fetched', { 'projects.count': projectIds.length });

      if (!projectIds.length) {
        return { rebuilds: [], projectIds: [] };
      }

      // Then fetch software updates that are connected to those projects via their products.
      const rebuilds = await DatabaseReads.softwareUpdates.findMany({
        where: {
          Products: {
            some: {
              ProjectId: { in: projectIds }
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
          Version: true,
          Paused: true,
          InitiatedBy: {
            select: {
              Name: true,
              Email: true
            }
          },
          ApplicationType: {
            select: {
              Name: true,
              Description: true
            }
          },
          Products: {
            where: {
              ProjectId: { in: projectIds }
            },
            select: {
              Id: true,
              Project: {
                select: {
                  Id: true,
                  Name: true,
                  Organization: {
                    select: {
                      Id: true,
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
      });
      span.addEvent('Software updates fetched', { 'rebuilds.count': rebuilds.length });

      // Map rebuilds to include project and organization info, and gather all relevant project IDs for efficient SSE updates.
      const rebuildsWithProjects = rebuilds.map((rebuild) => {
        const uniqueProjects = new Map<
          number,
          { Id: number; Name: string | null; Organization: { Id: number; Name: string | null } }
        >();
        rebuild.Products.forEach((product) => {
          if (product.Project) {
            uniqueProjects.set(product.Project.Id, {
              Id: product.Project.Id,
              Name: product.Project.Name,
              Organization: product.Project.Organization
            });
          }
        });

        // For simplicity in the client, we include organization info on each rebuild
        const firstProject = Array.from(uniqueProjects.values())[0];
        return {
          Id: rebuild.Id,
          Comment: rebuild.Comment,
          DateCreated: rebuild.DateCreated,
          DateCompleted: rebuild.DateCompleted,
          Version: rebuild.Version,
          Paused: rebuild.Paused,
          InitiatedBy: rebuild.InitiatedBy,
          ApplicationType: rebuild.ApplicationType,
          Organization: firstProject?.Organization ?? { Id: -1, Name: null },
          Projects: Array.from(uniqueProjects.values()),
          _count: rebuild._count,
          projectIds: Array.from(uniqueProjects.keys())
        };
      });

      const allProjectIds = Array.from(new Set(rebuildsWithProjects.flatMap((r) => r.projectIds)));

      return {
        rebuilds: rebuildsWithProjects,
        projectIds: allProjectIds
      };
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

export type RebuildsForOrgResult = Awaited<ReturnType<typeof getRebuildsForOrgIds>>;
export type SoftwareUpdatesSSE = RebuildsForOrgResult;
export type RebuildItem = RebuildsForOrgResult['rebuilds'][0];
