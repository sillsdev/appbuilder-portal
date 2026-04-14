import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getRebuilds } from '$lib/software-updates';

// Parse organization IDs from query parameter
// Handle POST requests to establish an SSE connection for rebuild data
export async function POST({ locals, params }) {
  locals.security.requireAuthenticated();
  const orgId = Number(params.orgId);
  locals.security.requireAdminOfOrgIn([orgId]);

  return produce(async function start({ emit }) {
    const rebuilds = await getRebuilds(locals.security, orgId ? [orgId] : undefined);
    const organizations = [
      ...rebuilds.complete.flatMap((u) => u.OrganizationIds),
      ...rebuilds.incomplete.flatMap((u) => u.OrganizationIds)
    ];

    const { error } = emit('rebuilds', stringify(rebuilds));
    if (error) {
      return;
    }

    async function updateCb(orgIds: number[]) {
      try {
        const overlap = orgIds.filter((u) => organizations.includes(u));

        if (overlap) {
          const rebuildsData = await getRebuilds(locals.security, overlap ? overlap : undefined);
          const { error } = emit('rebuilds', stringify(rebuildsData));
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
      if (!error) {
        return;
      }

      SSEPageUpdates.off('softwareUpdates', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
