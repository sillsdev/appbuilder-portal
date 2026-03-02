import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

export async function createManyAndReturn(createManyData: Prisma.UserTasksCreateManyArgs) {
  const res = await prisma.userTasks.createManyAndReturn({
    ...createManyData,
    select: {
      Id: true
    }
  });
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [createManyData.data].flat().map((r) => r.UserId)
  });
  return res;
}

export async function deleteMany(deleteManyData: Prisma.UserTasksDeleteManyArgs) {
  const users = await prisma.users.findMany({
    where: { UserTasks: { some: deleteManyData.where } },
    select: {
      Id: true
    }
  });
  const res = await prisma.userTasks.deleteMany({
    ...deleteManyData
  });

  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: users.map((u) => u.Id)
  });
  return res;
}

export async function updateMany(updateManyData: Prisma.UserTasksUpdateManyArgs) {
  const beforeUsers = (
    await prisma.users.findMany({
      where: {
        UserTasks: {
          some: updateManyData.where
        }
      },
      select: {
        Id: true
      }
    })
  ).map((u) => u.Id);
  const after = new Date();
  const res = await prisma.userTasks.updateMany({
    ...updateManyData
  });
  const afterUsers = (
    await prisma.users.findMany({
      where: {
        UserTasks: {
          some: {
            ...updateManyData.where,
            DateUpdated: {
              gte: after
            }
          }
        },
        Id: { notIn: beforeUsers }
      },
      select: {
        Id: true
      }
    })
  ).map((u) => u.Id);
  getQueues().SvelteSSE.add(`Update UserTasks`, {
    type: BullMQ.JobType.SvelteSSE_UpdateUserTasks,
    userIds: [...beforeUsers, ...afterUsers]
  });
  return res;
}
