import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals, url }) => {
  locals.security.requireSuperAdmin();

  const buildEngineProjectId = Number(params.id);
  const bucket = decodeURIComponent(url.searchParams.get('bucket') ?? '');

  const defaultBuildEngine = await DatabaseReads.systemStatuses.findFirstOrThrow({
    where: {
      OrganizationId: null
    },
    select: { BuildEngineUrl: true }
  });
  const projects = (
    await DatabaseReads.projects.findMany({
      where: { BuildEngineProjectId: buildEngineProjectId },
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
    })
  ).filter((p) => !bucket || p.RepositoryUrl === bucket);
  if (!projects.length) {
    error(404);
  } else if (projects.length === 1) {
    return redirect(303, localizeHref(`/projects/${projects[0].Id}`));
  }
  return { projects, defaultBuildEngine };
}) satisfies PageServerLoad;
