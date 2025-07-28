// src/routes/+page.server.ts

import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async () => {
  const organizations = await DatabaseReads.organizations.findMany({
    include: { Owner: true }
  });

  return { organizations };
}) satisfies PageServerLoad;
