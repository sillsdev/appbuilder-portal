import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseReads } from '$lib/server/database';

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  const project = await DatabaseReads.projects.findFirst({
    where: { Products: { some: { Id: params.id } } },
    select: {
      OwnerId: true,
      OrganizationId: true,
      GroupId: true,
      Id: true
    }
  });
  if (!project) error(404);
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groups.findMany({
      where: { Users: { some: { Id: locals.security.userId } }, Id: project.GroupId }
    }),
    project
  );
  return redirect(303, localizeHref(`/projects/${project.Id}#${params.id}`));
}) satisfies PageServerLoad;
