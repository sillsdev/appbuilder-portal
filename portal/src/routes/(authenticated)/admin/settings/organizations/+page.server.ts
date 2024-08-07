// src/routes/+page.server.ts

import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const organizations = await prisma.organizations.findMany({
    include: { Owner: true }
  });

  return { organizations };
}) satisfies PageServerLoad;
