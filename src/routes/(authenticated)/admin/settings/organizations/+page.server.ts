// src/routes/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireSuperAdmin();
  const organizations = await DatabaseReads.organizations.findMany();

  return { organizations };
}) satisfies PageServerLoad;
