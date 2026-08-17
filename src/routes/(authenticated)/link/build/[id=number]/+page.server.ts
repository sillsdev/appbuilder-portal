import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineBuildId = Number(params.id);
  const origin = decodeURIComponent(url.searchParams.get('origin') ?? '');

  const defaultBuildEngine = await DatabaseReads.systemStatuses.findFirstOrThrow({
    where: {
      OrganizationId: null
    },
    select: { BuildEngineUrl: true }
  });
  const builds = (
    await DatabaseReads.productBuilds.findMany({
      where: { BuildEngineBuildId: buildEngineBuildId },
      select: {
        ProductId: true,
        BuildEngineBuildId: true,
        Product: {
          select: {
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
                Organization: {
                  select: {
                    Id: true,
                    Name: true,
                    UseDefaultBuildEngine: true,
                    System: {
                      select: {
                        BuildEngineUrl: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  ).filter(
    (b) =>
      !origin ||
      (b.Product.Project.Organization.UseDefaultBuildEngine
        ? defaultBuildEngine.BuildEngineUrl
        : b.Product.Project.Organization.System?.BuildEngineUrl) === origin
  );
  if (!builds.length) {
    error(404);
  } else if (builds.length === 1) {
    return redirect(
      303,
      localizeHref(`/products/${builds[0].ProductId}/files?buildId=${buildEngineBuildId}`)
    );
  }
  return { builds, defaultBuildEngine };
}) satisfies PageServerLoad;
