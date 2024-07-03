import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const project = await prisma.projects.findUnique({
    where: {
      Id: parseInt(params.id)
    }
  });
  return { project };
}) satisfies PageServerLoad;
