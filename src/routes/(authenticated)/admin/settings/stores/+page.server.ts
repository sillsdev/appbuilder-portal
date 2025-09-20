// src/routes/admin/settings/stores/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const stores = await DatabaseReads.stores.findMany({
    include: { StoreType: true }
  });

  return { stores };
}) satisfies PageServerLoad;
