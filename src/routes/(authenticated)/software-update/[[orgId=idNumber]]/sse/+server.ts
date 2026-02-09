import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { DatabaseReads } from '$lib/server/database';

// Parse organization IDs from query parameter
function parseIdsParam(idsParam: string | null): number[] {
  if (!idsParam) return [];
  return idsParam
    .split(',')
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}

type RebuildResult = {
  rebuilds: Array<{
    Id: number;
    Comment: string;
    DateCreated: Date | null;
    DateCompleted: Date | null;
    Version: string;
    Paused: boolean;
    InitiatedBy: {
      Name: string | null;
      Email: string | null;
    };
    ApplicationType: {
      Name: string | null;
      Description: string | null;
    };
    Projects: Array<{
      Id: number;
      Name: string | null;
    }>;
    _count: {
      Products: number;
    };
    projectIds: number[];
  }>;
  projectIds: number[];
};

// Fetch rebuild data for organizations
async function getRebuilds(orgIds: number[]): Promise<RebuildResult> {
  if (!orgIds.length) {
    return {
      rebuilds: [],
      projectIds: []
    };
  }

  // Get all projects from the target organizations
  const orgProjects = await DatabaseReads.projects.findMany({
    where: {
      OrganizationId: { in: orgIds }
    },
    select: { Id: true }
  });

  const projectIds = orgProjects.map((p) => p.Id);

  if (!projectIds.length) {
    return {
      rebuilds: [],
      projectIds: []
    };
  }

  // Get all software updates that have products from these projects
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
          ProjectId: true,
          Project: {
            select: {
              Id: true,
              Name: true
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

  // Transform the data to deduplicate projects and extract project IDs
  const rebuildsWithProjects = rebuilds.map((rebuild) => {
    const uniqueProjects = new Map<number, { Id: number; Name: string | null }>();
    rebuild.Products.forEach((product) => {
      if (product.Project) {
        uniqueProjects.set(product.Project.Id, {
          Id: product.Project.Id,
          Name: product.Project.Name
        });
      }
    });

    return {
      Id: rebuild.Id,
      Comment: rebuild.Comment,
      DateCreated: rebuild.DateCreated,
      DateCompleted: rebuild.DateCompleted,
      Version: rebuild.Version,
      Paused: rebuild.Paused,
      InitiatedBy: rebuild.InitiatedBy,
      ApplicationType: rebuild.ApplicationType,
      Projects: Array.from(uniqueProjects.values()),
      _count: rebuild._count,
      projectIds: Array.from(uniqueProjects.keys())
    };
  });

  // Get all unique project IDs across all rebuilds
  const allProjectIds = Array.from(new Set(rebuildsWithProjects.flatMap((r) => r.projectIds)));

  return {
    rebuilds: rebuildsWithProjects,
    projectIds: allProjectIds
  };
}

// Handle POST requests to establish an SSE connection for rebuild data
export async function POST(request) {
  request.locals.security.requireAuthenticated();

  // Get organization IDs from query params (passed from client)
  const orgIds = parseIdsParam(request.url.searchParams.get('orgIds'));

  if (!orgIds.length) {
    return new Response('No organization IDs provided', { status: 400 });
  }

  // Check user permissions for each organization
  for (const orgId of orgIds) {
    request.locals.security.requireMemberOfOrgOrSuperAdmin(orgId);
  }

  // Return SSE stream
  return produce(async function start({ emit }) {
    // Send initial rebuild data
    const initial = await getRebuilds(orgIds);
    if (!initial || !initial.rebuilds) {
      return;
    }
    const { error } = emit('rebuilds', stringify(initial.rebuilds));
    if (error) {
      return;
    }
    // Store relevant project IDs for update checks
    const relevantProjectIds = initial.projectIds;
    // Define callback to handle project updates
    async function updateCb(updateIds: number[]) {
      // If any updated project intersects with relevant projects, emit fresh data
      if (relevantProjectIds.some((pid: number) => updateIds.includes(pid))) {
        const current = await getRebuilds(orgIds);
        if (!current || !current.rebuilds) {
          return;
        }
        const { error } = emit('rebuilds', stringify(current.rebuilds));
        if (error) {
          SSEPageUpdates.off('projectPage', updateCb);
          clearInterval(pingInterval);
        }
      }
    }

    // Register the update callback
    SSEPageUpdates.on('projectPage', updateCb);

    // Set up periodic ping to detect disconnections
    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off('projectPage', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
