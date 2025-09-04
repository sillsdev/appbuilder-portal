import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

export async function createMany(createManyData: Prisma.UserTasksCreateManyArgs) {
  const res = await prisma.userTasks.createMany({
    ...createManyData
  });
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    OTContext: null,
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
    OTContext: null,
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
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    OTContext: null,
    userIds: [...new Set([...beforeUsers.map((r) => r.UserId), ...afterUsers.map((r) => r.UserId)])]
  });
  return res;
}
