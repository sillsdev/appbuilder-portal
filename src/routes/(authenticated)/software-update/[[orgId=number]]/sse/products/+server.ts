import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import OTEL from '$lib/otel/index.js';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getProducts } from '$lib/software-updates/server';
import { stringifyError } from '$lib/utils/index.js';
import { logLocalDev } from '$lib/utils/server.js';

// Handle POST requests to establish an SSE connection for products data
export async function POST({ locals, params }) {
  const orgId = params.orgId ? Number(params.orgId) : undefined;
  if (orgId) {
    locals.security.requireAdminOfOrg(orgId);
  } else {
    locals.security.requireAdminOfAny();
  }

  return produce(async function start({ emit }) {
    const orgIdAsList = orgId ? [orgId] : undefined;
    const updates = await getProducts(locals.security, orgIdAsList);

    const { error } = emit('products', stringify(updates));
    if (error) {
      return;
    }

    async function updateCb(orgIds: number[]) {
      try {
        if (!orgId || orgIds.includes(orgId)) {
          const updates = await getProducts(locals.security, orgIdAsList);
          const { error } = emit('products', stringify(updates));
          if (error) {
            SSEPageUpdates.off('updatableProducts', updateCb);
            clearInterval(pingInterval);
          }
        }
      } catch (err) {
        OTEL.instance.logger.error(stringifyError(err));
        logLocalDev?.('Error in software-update SSE updateCb:', err);
        SSEPageUpdates.off('updatableProducts', updateCb);
        clearInterval(pingInterval);
        emit('error', stringify({ message: 'Failed to fetch updatable products' }));
        return;
      }
    }

    SSEPageUpdates.on('updatableProducts', updateCb);

    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) {
        return;
      }

      SSEPageUpdates.off('updatableProducts', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
