// src/routes/admin/settings/store-types/+page.server.ts

import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const storeTypes = await prisma.storeTypes.findMany();

  return { storeTypes };
}) satisfies PageServerLoad;
