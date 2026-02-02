import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { DatabaseReads } from '$lib/server/database';

// Define the structure of the status result
type StatusResult = {
  ids: number[];
  count: number;
  paused: boolean;
  allCompleted: boolean;
  completedProducts: number;
  projectIds: number[];
};

// Parse the 'ids' query parameter into an array of numbers, removing invalid entries
function parseIdsParam(idsParam: string | null): number[] {
  if (!idsParam) return [];
  return idsParam
    .split(',')
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
}

// Fetch the status of software updates based on provided IDs
async function getStatus(ids: number[]): Promise<StatusResult | { error: string }> {
  if (!ids.length) {
    return { error: 'No valid ids' };
  }
  const updates = await DatabaseReads.softwareUpdates.findMany({
    where: { Id: { in: ids } },
    select: {
      Id: true,
      Paused: true,
      DateCompleted: true,
      Version: true,
      DateCreated: true,
      Products: {
        select: {
          Id: true,
          ProjectId: true,
          ProductBuilds: {
            where: { Success: true },
            orderBy: { DateCreated: 'desc' },
            take: 1,
            select: { AppBuilderVersion: true, DateCreated: true }
          }
        }
      }
    }
  });

  // Determine if any updates are paused and if all are completed
  const paused = updates.some((u) => !!u.Paused);
  const allCompleted = updates.length > 0 && updates.every((u) => !!u.DateCompleted);

  // Calculate progress: how many products have successful builds with target version
  // i think replace this??
  let completedProducts = 0;
  for (const u of updates) {
    for (const p of u.Products) {
      const build = p.ProductBuilds[0];
      if (
        build &&
        build.AppBuilderVersion === u.Version &&
        build.DateCreated &&
        u.DateCreated &&
        build.DateCreated >= u.DateCreated!
      ) {
        completedProducts++;
      }
    }
  }

  // Extract unique project IDs associated with the updates
  const projectIds = Array.from(
    new Set(
      updates.flatMap((u) =>
        u.Products.map((p) => p.ProjectId).filter((id): id is number => id != null)
      )
    )
  );

  // Return the compiled status result
  return {
    ids,
    count: updates.length,
    paused,
    allCompleted,
    completedProducts,
    projectIds
  };
}

// Handle POST requests to establish an SSE connection for software update status
// this will also need to be very different

export async function POST(request) {
  request.locals.security.requireAuthenticated();
  // Parse IDs from query parameters
  const ids = parseIdsParam(request.url.searchParams.get('ids'));

  // Return SSE stream
  return produce(async function start({ emit }) {
    // Send initial status
    const initial = (await getStatus(ids)) as StatusResult;
    const { error } = emit('status', stringify(initial));
    if (error) {
      return;
    }
    // Store relevant project IDs for update checks
    const relevantProjectIds = initial.projectIds;
    // Define callback to handle project updates
    async function updateCb(updateIds: number[]) {
      // If any updated project intersects with relevant projects, emit fresh status
      if (relevantProjectIds.some((pid) => updateIds.includes(pid))) {
        // Get current status
        const current = await getStatus(ids);
        // Emit updated status
        const { error } = emit('status', stringify(current));
        // If there's an error (e.g., client disconnected), clean up
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
      // Send periodic ping to keep connection alive and detect disconnects
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off('projectPage', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
