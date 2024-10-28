import type { Prisma } from '@prisma/client';
import { redirect } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { pruneProjects } from '$lib/projects/common';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';

const bulkProjectOperationSchema = v.object({
  operation: v.picklist(['archive', 'reactivate', 'rebuild/republish']),
  projects: v.array(v.object({ Id: idSchema, OwnerId: idSchema, Archived: v.boolean() }))
});

export const load = (async ({ params, url, locals }) => {
  const userId = (await locals.auth())?.user.userId;
  const orgId = parseInt(params.id);
  if (isNaN(orgId) || !(orgId + '' === params.id)) {
    const paths = url.pathname.split('/');
    return redirect(302, paths.slice(0, paths.length - 1).join('/'));
  }
  const selector = params.filter as 'organization' | 'active' | 'archived' | 'all' | 'own';
  const whereStatements: Record<typeof selector, Prisma.ProjectsWhereInput> = {
    organization: {
      OrganizationId: orgId,
      DateArchived: null
    },
    active: {
      OrganizationId: orgId,
      DateActive: {
        not: null
      },
      DateArchived: null
    },
    archived: {
      OrganizationId: orgId,
      DateArchived: {
        not: null
      }
    },
    all: {
      OrganizationId: orgId
    },
    own: {
      OrganizationId: orgId,
      OwnerId: userId,
      DateArchived: null
    }
  };
  const projects = await prisma.projects.findMany({
    where: whereStatements[selector],
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
  return { projects: pruneProjects(projects), form: superValidate({
    operation: 'rebuild/republish'
  }, valibot(bulkProjectOperationSchema)) };
}) satisfies PageServerLoad;
