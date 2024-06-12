// src/routes/admin/settings/stores/+page.server.ts

import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const stores = await prisma.stores.findMany({
    include: { StoreType: true }
  });

  return { stores };
}) satisfies PageServerLoad;
