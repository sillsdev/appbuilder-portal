import { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index.js';
import prisma from './prisma.js';

export async function createMany(createManyData: Prisma.UserTasksCreateManyArgs) {
  const res = await prisma.userTasks.createMany({
    ...createManyData
  });
  getQueues().SvelteProjectSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [createManyData.data].flat().map((r) => r.UserId)
  });
  return res;
}

export async function deleteMany(deleteManyData: Prisma.UserTasksDeleteManyArgs) {
  const rows = await prisma.userTasks.findMany({
    ...deleteManyData
  });
  const res = await prisma.userTasks.deleteMany({
    ...deleteManyData
  });

  getQueues().SvelteProjectSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [...new Set(rows.map((r) => r.UserId))]
  });
  return res;
}

export async function updateMany(updateManyData: Prisma.UserTasksUpdateManyArgs) {
  const beforeUsers = await prisma.userTasks.findMany({
    where: updateManyData.where
  });
  const res = await prisma.userTasks.updateMany({
    ...updateManyData
  });
  const afterUsers = await prisma.userTasks.findMany({
    where: updateManyData.where
  });
  getQueues().SvelteProjectSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [...new Set([...beforeUsers.map((r) => r.UserId), ...afterUsers.map((r) => r.UserId)])]
  });
  return res;
}
