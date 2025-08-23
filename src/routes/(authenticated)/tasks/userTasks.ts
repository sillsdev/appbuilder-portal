import { DatabaseReads } from '$lib/server/database';

export type UserTaskDataSSE = Awaited<ReturnType<typeof getUserTasks>>;
export async function getUserTasks(userId: number) {
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
