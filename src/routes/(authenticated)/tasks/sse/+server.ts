import { stringify } from 'devalue';
import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { getUserTasks } from '$lib/projects/sse';

export async function POST(request) {
  const userId = (await request.locals.auth())!.user.userId;
  return produce(async function start({ emit, lock }) {
    const { error } = emit('userTasks', stringify(await getUserTasks(userId)));
    if (error) {
      return;
    }
    async function updateCb(updateId: number[]) {
      if (updateId.includes(userId)) {
        const userTaskData = await getUserTasks(userId);
        const { error } = emit('userTasks', stringify(userTaskData));
        if (error) {
          SSEPageUpdates.off('userTasksPage', updateCb);
          clearInterval(pingInterval);
        }
      }
    }
    SSEPageUpdates.on('userTasksPage', updateCb);
    const pingInterval = setInterval(function onDisconnect() {
      const { error } = emit('ping', '');
      if (!error) return;
      SSEPageUpdates.off('userTasksPage', updateCb);
      clearInterval(pingInterval);
    }, 10000).unref();
  });
}
