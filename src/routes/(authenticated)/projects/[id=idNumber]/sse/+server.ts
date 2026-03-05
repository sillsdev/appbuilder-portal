import { createProducer, getProjectDetails } from '$lib/projects/sse';
import { DatabaseReads } from '$lib/server/database';

export async function POST({ locals, params }) {
  locals.security.requireAuthenticated();
  const id = parseInt(params.id);
  locals.security.requireProjectReadAccess(
    await DatabaseReads.groups.findMany({
      where: { Users: { some: { Id: locals.security.userId } } },
      select: { Id: true }
    }),
    await DatabaseReads.projects.findUnique({
      where: { Id: id }
    })
  );
  return createProducer(
    id,
    locals.security.sessionForm,
    'projectPage',
    'projectData',
    getProjectDetails
  );
}
