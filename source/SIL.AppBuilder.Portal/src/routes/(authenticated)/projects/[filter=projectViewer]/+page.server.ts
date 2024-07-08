import prisma from '$lib/prisma';
import { pruneProjects } from '../common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const selector = params.filter as 'all' | 'own';
  console.log((await locals.auth())?.user.userId);
  const projects = await prisma.projects.findMany({
    where: {
      OwnerId: selector === 'all' ? undefined : (await locals.auth())?.user.userId
    },
    include: {
      Products: {
        include: {
          ProductDefinition: true
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    }
  });
  // TODO: Likely need to paginate
  return { projects: pruneProjects(projects) };
}) satisfies PageServerLoad;
