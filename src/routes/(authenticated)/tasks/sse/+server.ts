import { produce } from 'sveltekit-sse';
import { SSEPageUpdates } from '$lib/projects/listener';
import { DatabaseReads } from '$lib/server/database';

export async function POST(request) {
  const userId = (await request.locals.auth())!.user.userId;
  return produce(async function start({ emit, lock }) {
    const { error } = emit('userTasks', JSON.stringify(await getUserTasks(userId)));
    if (error) {
      return;
    }
    async function updateCb(updateId: number[]) {
      if (updateId.includes(userId)) {
        // console.log(`User tasks page SSE update for user ${userId}`);
        const userTaskData = await getUserTasks(userId);
        const { error } = emit('userTasks', JSON.stringify(userTaskData));
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
    }, 10000);
  });
}

export type UserTaskDataSSE = Awaited<ReturnType<typeof getUserTasks>>;
async function getUserTasks(userId: number) {
  const tasks = await DatabaseReads.userTasks.findMany({
    where: {
      UserId: userId
    },
    include: {
      Product: {
        include: {
          Project: true,
          ProductDefinition: {
            include: {
              Workflow: true
            }
          }
        }
      }
    },
    distinct: 'ProductId',
    orderBy: {
      // most recent first
      DateUpdated: 'desc'
    }
  });
  return tasks;
}
