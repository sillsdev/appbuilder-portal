import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDefaultBuildEngine } from '$lib/organizations/server';
import { localizeHref } from '$lib/paraglide/runtime';
import { getLinkSuffix } from '$lib/products';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineBuildId = Number(params.id);
  const bucket = url.searchParams.get('bucket');
  const builds = await DatabaseReads.productBuilds.findMany({
    where: {
      BuildEngineBuildId: buildEngineBuildId,
      Product: bucket ? { Project: { RepositoryUrl: bucket } } : undefined
    },
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
  if (!builds.length) {
    error(404);
  } else if (builds.length === 1) {
    return redirect(
      303,
      localizeHref(
        `/products/${builds[0].ProductId}/files${getLinkSuffix('build', buildEngineBuildId)}`
      )
    );
  }
  return { builds, defaultBuildEngine: await getDefaultBuildEngine() };
}) satisfies PageServerLoad;
