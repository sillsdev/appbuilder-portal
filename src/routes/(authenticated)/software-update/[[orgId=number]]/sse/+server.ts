import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getUpdates } from '$lib/software-updates/server';

// Parse organization IDs from query parameter
// Handle POST requests to establish an SSE connection for rebuild data
export async function POST({ locals, params }) {
  const orgId = params.orgId ? Number(params.orgId) : undefined;
  if (orgId) {
    locals.security.requireAdminOfOrg(orgId);
  } else {
    locals.security.requireAdminOfAny();
  }

  return produce(async function start({ emit }) {
    const orgIdAsList = orgId ? [orgId] : undefined;
    const updates = await getUpdates(locals.security, orgIdAsList);

    const { error } = emit('updates', stringify(updates));
    if (error) {
      return;
    }

    async function updateCb(orgIds: number[]) {
      try {
        if (!orgId || orgIds.includes(orgId)) {
          const updates = await getUpdates(locals.security, orgIdAsList);
          const { error } = emit('updates', stringify(updates));
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
