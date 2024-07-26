import prisma from '$lib/prisma';
import { error } from '@sveltejs/kit';
import { pruneProjects } from '../projects/common';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const userId = (await locals.auth())?.user.userId;
  if (!userId) return error(400);
  // const orgs = await getOrganizationsForUser(userId);
  const projects = await prisma.projects.findMany({
    where: {
      IsPublic: true
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
  const productDefinitions = await prisma.productDefinitions.findMany();
  // TODO: Likely need to paginate
  return { projects: pruneProjects(projects), productDefinitions };
}) satisfies PageServerLoad;
