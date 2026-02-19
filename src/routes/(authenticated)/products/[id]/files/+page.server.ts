import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { paginateSchema } from '$lib/valibot';

export const load = (async ({ params, locals }) => {
  const project = (
    await DatabaseReads.products.findUnique({
      where: { Id: params.id },
      select: {
        Project: { select: { OwnerId: true, OrganizationId: true, GroupId: true } },
        Id: true
      }
    })
  )?.Project;
  if (!project) error(404);
  locals.security.requireAuthenticated();
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groups.findMany({
      where: { Users: { some: { Id: locals.security.userId } }, Id: project.GroupId }
    }),
    project
  );
  const builds = await DatabaseReads.productBuilds.findMany({
    orderBy: [
      {
        DateUpdated: 'desc'
      }
    ],
    where: {
      ProductId: params.id
    },
    select: {
      Version: true,
      BuildEngineBuildId: true,
      Success: true,
      AppBuilderVersion: true,
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
          LogUrl: true,
          PublishLink: true,
          DateResolved: true
        },
        orderBy: {
          DateUpdated: 'desc'
        },
        take: 1
      }
    },
    take: 3
  });
  const product = await DatabaseReads.products.findUnique({
    where: {
      Id: params.id
    },
    select: {
      CurrentBuildId: true,
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
    count: await DatabaseReads.productBuilds.count({ where: { ProductId: params.id } })
  };
}) satisfies PageServerLoad;

export const actions = {
  page: async ({ request, params, locals }) => {
    const project = (
      await DatabaseReads.products.findUnique({
        where: { Id: params.id },
        select: {
          Project: { select: { OwnerId: true, OrganizationId: true, GroupId: true } }
        }
      })
    )?.Project;
    if (!project) error(404);
    locals.security.requireAuthenticated();
    locals.security.requireProjectReadAccess(
      await DatabaseReads.groups.findMany({
        where: { Users: { some: { Id: locals.security.userId } }, Id: project.GroupId }
      }),
      project
    );
    const form = await superValidate(request, valibot(paginateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const builds = await DatabaseReads.productBuilds.findMany({
      orderBy: [
        {
          DateUpdated: 'desc'
        }
      ],
      where: {
        ProductId: params.id
      },
      select: {
        Version: true,
        BuildEngineBuildId: true,
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
            LogUrl: true,
            PublishLink: true,
            DateResolved: true
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

    return {
      form,
      ok: true,
      query: {
        data: builds,
        // update count, just in case more builds were added
        count: await DatabaseReads.productBuilds.count({ where: { ProductId: params.id } })
      }
    };
  }
} satisfies Actions;
