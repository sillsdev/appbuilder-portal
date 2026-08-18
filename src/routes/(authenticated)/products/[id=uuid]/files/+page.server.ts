import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { queryURLandToken } from '$lib/server/build-engine-api/requests';
import { DatabaseReads } from '$lib/server/database';
import { paginateSchema } from '$lib/valibot';

function parseId(security: Security, url: URL, param: string) {
  const parsed = parseInt(url.searchParams.get(param) ?? 'NaN');
  return security.isSuperAdmin && !isNaN(parsed) ? parsed : undefined;
}

export const load = (async ({ params, locals, url }) => {
  locals.security.requireAuthenticated();
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
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groups.findMany({
      where: { Users: { some: { Id: locals.security.userId } }, Id: project.GroupId }
    }),
    project
  );
  const defaultPageSize = 3;
  const buildId = parseId(locals.security, url, 'buildId');
  const releaseId = parseId(locals.security, url, 'releaseId');
  let page: number | null = null;
  if (buildId) {
    const buildIds = await DatabaseReads.productBuilds.findMany({
      orderBy: {
        DateCreated: 'desc'
      },
      where: {
        ProductId: params.id
      },
      select: { BuildEngineBuildId: true }
    });
    const index = buildIds.findIndex((b) => b.BuildEngineBuildId === buildId);
    page = index >= 0 ? Math.floor(index / defaultPageSize) : null;
  } else if (releaseId) {
    const releaseIds = await DatabaseReads.productBuilds.findMany({
      orderBy: {
        DateCreated: 'desc'
      },
      where: {
        ProductId: params.id
      },
      select: { ProductPublications: { select: { BuildEngineReleaseId: true } } }
    });
    const index = releaseIds.findIndex((b) =>
      b.ProductPublications.find((p) => p.BuildEngineReleaseId === releaseId)
    );
    page = index >= 0 ? Math.floor(index / defaultPageSize) : null;
  }
  const builds = await DatabaseReads.productBuilds.findMany({
    orderBy: {
      DateCreated: 'desc'
    },
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
          DateCreated: true,
          LogUrl: true,
          PublishLink: true,
          DateResolved: true,
          BuildEngineReleaseId: true
        },
        orderBy: {
          DateCreated: 'desc'
        },
        take: 1
      }
    },
    take: defaultPageSize,
    skip: page !== null ? page * defaultPageSize : undefined
  });
  const product = await DatabaseReads.products.findUniqueOrThrow({
    where: {
      Id: params.id
    },
    select: {
      CurrentBuildId: true,
      ProductDefinition: {
        select: {
          Name: true,
          Workflow: {
            select: {
              ProductType: true
            }
          }
        }
      },
      Project: {
        select: {
          Id: true,
          Name: true,
          OrganizationId: true
        }
      }
    }
  });
  return {
    product,
    buildEngineUrl: locals.security.isSuperAdmin
      ? (await queryURLandToken(product.Project.OrganizationId)).url
      : undefined,
    builds,
    form: await superValidate(
      { page: page !== null ? page : 0, size: defaultPageSize },
      valibot(paginateSchema)
    ),
    count: await DatabaseReads.productBuilds.count({ where: { ProductId: params.id } })
  };
}) satisfies PageServerLoad;

export const actions = {
  page: async ({ request, params, locals }) => {
    locals.security.requireAuthenticated();
    const project = (
      await DatabaseReads.products.findUnique({
        where: { Id: params.id },
        select: {
          Project: { select: { OwnerId: true, OrganizationId: true, GroupId: true } }
        }
      })
    )?.Project;
    if (!project) error(404);
    locals.security.requireProjectReadAccess(
      await DatabaseReads.groups.findMany({
        where: { Users: { some: { Id: locals.security.userId } }, Id: project.GroupId }
      }),
      project
    );
    const form = await superValidate(request, valibot(paginateSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const builds = await DatabaseReads.productBuilds.findMany({
      orderBy: {
        DateCreated: 'desc'
      },
      where: {
        ProductId: params.id
      },
      select: {
        Version: true,
        AppBuilderVersion: true,
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
            DateCreated: true,
            LogUrl: true,
            PublishLink: true,
            DateResolved: true,
            BuildEngineReleaseId: true
          },
          orderBy: {
            DateCreated: 'desc'
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
