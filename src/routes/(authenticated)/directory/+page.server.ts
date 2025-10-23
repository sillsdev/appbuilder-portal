import type { Prisma } from '@prisma/client';
import { type Actions } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { projectSearchSchema, pruneProjects } from '$lib/projects';
import { projectFilter } from '$lib/projects/server';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  const projects = await DatabaseReads.projects.findMany({
    where: {
      IsPublic: true
    },
    include: {
      Products: {
        include: {
          ProductDefinition: true,
          WorkflowInstance: true,
          ProductBuilds: {
            orderBy: { DateUpdated: 'desc' },
            take: 1
          }
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    },
    take: 10,
    orderBy: [
      {
        Name: 'asc'
      },
      { Id: 'asc' }
    ]
  });
  const productDefinitions = await DatabaseReads.productDefinitions.findMany();
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
    count: await DatabaseReads.projects.count({
      where: {
        IsPublic: true
      }
    }),
    organizations: await DatabaseReads.organizations.findMany({
      select: {
        Id: true,
        Name: true
      }
    })
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ request, locals }) {
    locals.security.requireAuthenticated();
    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter(form.data),
      IsPublic: true
    };

    const projects = await DatabaseReads.projects.findMany({
      where: where,
      include: {
        Products: {
          include: {
            ProductDefinition: true,
            WorkflowInstance: true,
            ProductBuilds: {
              orderBy: { DateUpdated: 'desc' },
              take: 1
            }
          }
        },
        Owner: true,
        Group: true,
        Organization: true
      },
      skip: form.data.page.size * form.data.page.page,
      take: form.data.page.size,
      orderBy: [
        {
          Name: 'asc'
        },
        { Id: 'asc' }
      ]
    });

    const count = await DatabaseReads.projects.count({ where: where });

    return { form, ok: true, query: { data: pruneProjects(projects), count } };
  }
};
