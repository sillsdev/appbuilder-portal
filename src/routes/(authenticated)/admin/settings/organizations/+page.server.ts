// src/routes/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async () => {
  return { organizations: await DatabaseReads.organizations.findMany() };
}) satisfies PageServerLoad;
