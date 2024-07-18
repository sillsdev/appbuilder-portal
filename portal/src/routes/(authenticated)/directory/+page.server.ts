import prisma, { getOrganizationsForUser } from '$lib/prisma';
import { error } from '@sveltejs/kit';
import { pruneProjects } from '../projects/common';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const userId = (await locals.auth())?.user.userId;
  if (!userId) return error(402);
  const orgs = await getOrganizationsForUser(userId);
  const projects = await prisma.projects.findMany({
    where: {
      OrganizationId: {
        in: orgs.map((org) => org.Id)
      }
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
