// src/routes/admin/settings/store-types/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async () => {
  const storeTypes = await DatabaseReads.storeTypes.findMany();

  return { storeTypes };
}) satisfies PageServerLoad;
