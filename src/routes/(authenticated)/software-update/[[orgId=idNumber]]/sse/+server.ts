import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { DatabaseReads } from '$lib/server/database';
import { getRebuildsForOrgIds } from '$lib/software-updates/sse';

// Parse organization IDs from query parameter
function parseIdsParam(idsParam: string | null): number[] {
  if (!idsParam) return [];
  return idsParam
    .split(',')
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
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
    // User will be allowed to see software updates until they reload
    // even if their permission is revoked during the SSE connection.
    const { error } = emit('rebuilds', stringify((await getRebuildsForOrgIds(orgIds)).rebuilds));
    if (error) {
      return;
    }

    async function updateCb(updateIds: number[]) {
      try {
        // This is a little wasteful because it will calculate much of the same data
        // multiple times if multiple users are connected to the same software update page.
        // We refetch the project list each time to handle dynamic organization changes.
        const currentProjects = await DatabaseReads.projects.findMany({
          where: { OrganizationId: { in: orgIds } },
          select: { Id: true }
        });
        const relevantProjectIds = currentProjects.map((p) => p.Id);

        if (updateIds.some((updateId) => relevantProjectIds.includes(updateId))) {
          const rebuildsData = await getRebuildsForOrgIds(orgIds);
          const { error } = emit('rebuilds', stringify(rebuildsData.rebuilds));
          if (error) {
            SSEPageUpdates.off('softwareUpdates', updateCb);
            clearInterval(pingInterval);
          }
        }
      } catch (err) {
        console.error('Error in software-update SSE updateCb:', err);
        SSEPageUpdates.off('softwareUpdates', updateCb);
        clearInterval(pingInterval);
        emit('error', stringify({ message: 'Failed to fetch software updates' }));
        return;
      }
    }

    SSEPageUpdates.on('softwareUpdates', updateCb);

    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off('softwareUpdates', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
