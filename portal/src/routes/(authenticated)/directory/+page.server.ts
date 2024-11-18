import { error, type Actions } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import type { Prisma } from '@prisma/client';
import { projectSearchSchema, pruneProjects } from '$lib/projects/common';
import { projectFilter } from '$lib/projects/common.server';
import type { PageServerLoad } from './$types';
import { superValidate, fail } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = (async ({ locals }) => {
  const userId = (await locals.auth())?.user.userId;
  if (!userId) return error(400);
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
    },
    take: 10
  });
  const productDefinitions = await prisma.productDefinitions.findMany();
  return {
    projects: pruneProjects(projects),
    productDefinitions,
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 10
        }
      },
      valibot(projectSearchSchema)
    ),
    count: await prisma.projects.count({
      where: {
        IsPublic: true
      }
    }),
    organizations: await prisma.organizations.findMany({
      select: {
        Id: true,
        Name: true
      }
    })
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ request, locals }) {
    const userId = (await locals.auth())?.user.userId;
    if (!userId) return error(400);

    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter(form.data),
      IsPublic: true
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
