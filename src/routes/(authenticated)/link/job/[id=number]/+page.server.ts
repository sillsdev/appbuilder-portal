import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDefaultBuildEngine } from '$lib/organizations/server';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineJobId = Number(params.id);
  const bucket = url.searchParams.get('bucket');
  const products = await DatabaseReads.products.findMany({
    where: {
      BuildEngineJobId: buildEngineJobId,
      Project: bucket ? { RepositoryUrl: bucket } : undefined
    },
    select: {
      Id: true,
      BuildEngineJobId: true,
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
  });
  if (!products.length) {
    error(404);
  } else if (products.length === 1) {
    return redirect(303, localizeHref(`/projects/${products[0].Project.Id}#${products[0].Id}`));
  }
  return { products, defaultBuildEngine: await getDefaultBuildEngine() };
}) satisfies PageServerLoad;
