import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getUpdates } from '$lib/software-updates/server';

// Parse organization IDs from query parameter
// Handle POST requests to establish an SSE connection for rebuild data
export async function POST({ locals, params }) {
  const orgId = params.orgId;
  if (orgId) {
    locals.security.requireAdminOfOrg(Number(orgId));
  } else {
    locals.security.requireAdminOfAny();
  }

  return produce(async function start({ emit }) {
    const updates = await getUpdates(locals.security, orgId ? [Number(orgId)] : undefined);
    const organizations = new Set(updates.flatMap((u) => u.Organizations.map((o) => o.Id)));

    const { error } = emit('updates', stringify(updates));
    if (error) {
      return;
    }

    async function updateCb(orgIds: number[]) {
      try {
        const overlap = orgIds.filter((u) => organizations.has(u));

        if (overlap.length > 0) {
          const updates = await getUpdates(locals.security, overlap);
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
