import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

export async function create(createData: Prisma.ProjectActionsUncheckedCreateInput) {
  try {
    const res = await prisma.projectActions.create({
      data: createData
    });
    getQueues().SvelteSSE.add(`Update Project #${createData.ProjectId} (action created)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [createData.ProjectId]
    });
    return res;
  } catch {
    return false;
  }
}

export async function createMany(
  createManyData: Prisma.ProjectActionsCreateManyInput[],
  projectId: number
) {
  try {
    const res = await prisma.projectActions.createMany({
      data: createManyData
    });
    getQueues().SvelteSSE.add(`Update Project #${projectId} (actions created)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [projectId]
    });
    return res;
  } catch {
    return false;
  }
}
