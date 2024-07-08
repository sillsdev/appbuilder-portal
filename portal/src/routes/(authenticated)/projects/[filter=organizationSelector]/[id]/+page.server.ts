import prisma from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { pruneProjects } from '../../common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, url }) => {
  const id = parseInt(params.id);
  if (isNaN(id) || !(id + '' === params.id)) {
    const paths = url.pathname.split('/');
    return redirect(302, paths.slice(0, paths.length - 1).join('/'));
  }
  const selector = params.filter as 'organization' | 'active' | 'archived';
  const projects = await prisma.projects.findMany({
    where: {
      OrganizationId: id,
      // TODO: how is this determined
      DateActive:
        selector === 'active'
          ? {
            not: null
          }
          : undefined,
      DateArchived:
        selector === 'archived'
          ? {
            not: null
          }
          : undefined
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
