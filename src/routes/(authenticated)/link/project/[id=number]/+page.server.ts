import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDefaultBuildEngine } from '$lib/organizations/server';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineProjectId = Number(params.id);
  const bucket = url.searchParams.get('bucket');
  const projects = await DatabaseReads.projects.findMany({
    where: { BuildEngineProjectId: buildEngineProjectId, RepositoryUrl: bucket || undefined },
    select: {
      Id: true,
      BuildEngineProjectId: true,
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
  });
  if (!projects.length) {
    error(404);
  } else if (projects.length === 1) {
    return redirect(303, localizeHref(`/projects/${projects[0].Id}`));
  }
  return { projects, defaultBuildEngine: await getDefaultBuildEngine() };
}) satisfies PageServerLoad;
