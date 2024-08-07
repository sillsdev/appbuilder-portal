import prisma from '$lib/server/prisma';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {
  const username = (
    await prisma.users.findUnique({
      where: {
        Id: parseInt(params.id ?? '')
      }
    })
  )?.Name;
  return { username };
}) satisfies LayoutServerLoad;
