// src/routes/admin/settings/store-types/+page.server.ts

import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const storeTypes = await prisma.storeTypes.findMany();

  return { storeTypes };
}) satisfies PageServerLoad;
