import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getProjectDetails } from '$lib/projects/sse';
import { DatabaseReads } from '$lib/server/database';

export async function POST(request) {
  request.locals.security.requireProjectReadAccess(
    await DatabaseReads.groupMemberships.findMany({
      where: { UserId: request.locals.security.userId },
      select: { GroupId: true }
    }),
    await DatabaseReads.projects.findUnique({
      where: { Id: parseInt(request.params.id) }
    })
  );
  const { id: strId } = request.params;
  return produce(async function start({ emit, lock }) {
    const id = parseInt(strId);
    // User will be allowed to see project updates until they reload
    // even if their permission is revoked during the SSE connection.
    const { error } = emit(
      'projectData',
      stringify(await getProjectDetails(id, request.locals.security.sessionForm))
    );
    if (error) {
      return;
    }
    async function updateCb(updateId: number[]) {
      // This is a little wasteful because it will calculate much of the same data
      // multiple times if multiple users are connected to the same project page.
      if (updateId.includes(id)) {
        // console.log(`Project page SSE update for project ${id}`);
        const projectData = await getProjectDetails(id, request.locals.security.sessionForm);
        const { error } = emit('projectData', stringify(projectData));
        if (error) {
          SSEPageUpdates.off('projectPage', updateCb);
          clearInterval(pingInterval);
        }
      }
    }
    SSEPageUpdates.on('projectPage', updateCb);
    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off('projectPage', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
