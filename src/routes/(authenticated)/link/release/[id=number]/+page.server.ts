import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDefaultBuildEngine } from '$lib/organizations/server';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineReleaseId = Number(params.id);
  const bucket = url.searchParams.get('bucket');
  const releases = await DatabaseReads.productPublications.findMany({
    where: {
      BuildEngineReleaseId: buildEngineReleaseId,
      Product: bucket ? { Project: { RepositoryUrl: bucket } } : undefined
    },
    select: {
      ProductId: true,
      BuildEngineReleaseId: true,
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
              RepositoryUrl: true,
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
  });
  if (!releases.length) {
    error(404);
  } else if (releases.length === 1) {
    return redirect(
      303,
      localizeHref(`/products/${releases[0].ProductId}/files?releaseId=${buildEngineReleaseId}`)
    );
  }
  return { releases, defaultBuildEngine: await getDefaultBuildEngine() };
}) satisfies PageServerLoad;
