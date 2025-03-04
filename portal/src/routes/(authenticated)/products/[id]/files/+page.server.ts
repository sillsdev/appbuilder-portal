import { paginateSchema } from '$lib/table';
import { error, fail } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const builds = await prisma.productBuilds.findMany({
    orderBy: [
      {
        DateUpdated: 'desc'
      }
    ],
    where: {
      ProductId: params.id
    },
    select: {
      Id: true,
      Version: true,
      BuildId: true,
      Success: true,
      ProductArtifacts: {
        select: {
          ArtifactType: true,
          Url: true,
          FileSize: true,
          DateUpdated: true
        }
      },
      ProductPublications: {
        select: {
          Channel: true,
          Success: true,
          DateUpdated: true,
          LogUrl: true
        },
        orderBy: {
          DateUpdated: 'desc'
        },
        take: 1
      }
    },
    take: 3
  });
  const product = await prisma.products.findUnique({
    where: {
      Id: params.id
    },
    select: {
      WorkflowBuildId: true,
      ProductDefinition: {
        select: {
          Name: true
        }
      },
      Project: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  });
  return {
    product,
    builds,
    form: await superValidate({ page: 0, size: 3 }, valibot(paginateSchema)),
    count: await prisma.productBuilds.count({ where: { ProductId: params.id } })
  };
}) satisfies PageServerLoad;

export const actions = {
  page: async ({ request, params, locals }) => {
    const session = await locals.auth();
    if (!session) return error(403);
    const form = await superValidate(request, valibot(paginateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const builds = await prisma.productBuilds.findMany({
      orderBy: [
        {
          DateUpdated: 'desc'
        }
      ],
      where: {
        ProductId: params.id
      },
      select: {
        Id: true,
        Version: true,
        BuildId: true,
        Success: true,
        ProductArtifacts: {
          select: {
            ArtifactType: true,
            Url: true,
            FileSize: true,
            DateUpdated: true
          }
        },
        ProductPublications: {
          select: {
            Channel: true,
            Success: true,
            DateUpdated: true,
            LogUrl: true
          },
          orderBy: {
            DateUpdated: 'desc'
          },
          take: 1
        }
      },
      skip: form.data.page * form.data.size,
      take: form.data.size
    });

    return { form, ok: true, query: { data: builds }}
  }
} satisfies Actions;