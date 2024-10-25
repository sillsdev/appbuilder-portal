import { projectSearchSchema, pruneProjects } from '$lib/projects/common';
import { projectFilter } from '$lib/projects/common.server';
import type { Prisma } from '@prisma/client';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

function whereStatements(
  filter: string,
  orgId: number,
  userId?: number
): Prisma.ProjectsWhereInput {
  const selector = filter as 'organization' | 'active' | 'archived' | 'all' | 'own';
  switch (selector) {
  case 'organization':
    return {
      OrganizationId: orgId,
      DateArchived: null
    };
  case 'active':
    return {
      OrganizationId: orgId,
      DateActive: {
        not: null
      },
      DateArchived: null
    };
  case 'archived':
    return {
      OrganizationId: orgId,
      DateArchived: {
        not: null
      }
    };
  case 'all':
    return {
      OrganizationId: orgId
    };
  case 'own':
    return {
      OrganizationId: orgId,
      OwnerId: userId,
      DateArchived: null
    };
  }
}

export const load = (async ({ params, url, locals }) => {
  const userId = (await locals.auth())?.user.userId;
  const orgId = parseInt(params.id);
  if (isNaN(orgId) || !(orgId + '' === params.id)) {
    const paths = url.pathname.split('/');
    return redirect(302, paths.slice(0, paths.length - 1).join('/'));
  }
  const projects = await prisma.projects.findMany({
    where: whereStatements(params.filter, orgId, userId),
    include: {
      Products: {
        include: {
          ProductDefinition: true
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    },
    take: 10
  });
  return {
    projects: pruneProjects(projects),
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 10
        },
        organizationId: orgId
      },
      valibot(projectSearchSchema)
    ),
    count: await prisma.projects.count({ where: whereStatements(params.filter, orgId, userId) }),
    productDefinitions: await prisma.productDefinitions.findMany()
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ params, request, locals }) {
    const userId = (await locals.auth())?.user.userId;
    if (!userId) return error(400);

    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter(form.data),
      ...whereStatements(params.filter!, parseInt(params.id!), userId)
    };

    const projects = await prisma.projects.findMany({
      where: where,
      include: {
        Products: {
          include: {
            ProductDefinition: true
          }
        },
        Owner: true,
        Group: true,
        Organization: true
      },
      skip: form.data.page.size * form.data.page.page,
      take: form.data.page.size
    });

    const count = await prisma.projects.count({ where: where });

    return { form, ok: true, query: { data: pruneProjects(projects), count } };
  }
};
