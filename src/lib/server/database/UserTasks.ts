import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

export async function createMany(createManyData: Prisma.UserTasksCreateManyArgs) {
  const res = await prisma.userTasks.createMany({
    ...createManyData
  });
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [createManyData.data].flat().map((r) => r.UserId)
  });
  return res;
}

export async function deleteMany(deleteManyData: Prisma.UserTasksDeleteManyArgs) {
  const rows = await prisma.userTasks.findMany({
    where: deleteManyData.where
  });
  const res = await prisma.userTasks.deleteMany({
    ...deleteManyData
  });

  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [...new Set(rows.map((r) => r.UserId))]
  });
  return res;
}

export async function updateMany(
  productIds: string[],
  updateManyData: Prisma.UserTasksUpdateManyArgs
) {
  const beforeUsers = (
    await prisma.userTasks.findMany({
      where: {
        ProductId: {
          in: productIds
        }
      }
    })
  ).map((r) => r.UserId);
  const res = await prisma.userTasks.updateMany({
    ...updateManyData
  });
  const afterUsers = (
    await prisma.userTasks.findMany({
      where: {
        ProductId: {
          in: productIds
        }
      }
    })
  ).map((r) => r.UserId);
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [...new Set([...beforeUsers, ...afterUsers])]
  });
  return res;
}
