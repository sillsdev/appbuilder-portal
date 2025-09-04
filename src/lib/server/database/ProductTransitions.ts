import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

export async function create(createData: Prisma.ProductTransitionsCreateArgs) {
  try {
    const res = await prisma.productTransitions.create({
      ...createData,
      include: { Product: { select: { ProjectId: true } } }
    });
    getQueues().SvelteSSE.add(`Update Project #${res.Product.ProjectId} (transition created)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      OTContext: null,
      projectIds: [res.Product.ProjectId]
    });
    return res;
  } catch {
    return false;
  }
}

export async function createMany(
  createManyData: Prisma.ProductTransitionsCreateManyArgs,
  projectId: number
) {
  try {
    const res = await prisma.productTransitions.createMany({
      ...createManyData
    });
    getQueues().SvelteSSE.add(`Update Project #${projectId} (transitions created)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      OTContext: null,
      projectIds: [projectId]
    });
    return res;
  } catch {
    return false;
  }
}

export async function update(updateData: Prisma.ProductTransitionsUpdateArgs) {
  try {
    const res = await prisma.productTransitions.update({
      ...updateData,
      include: { Product: { select: { ProjectId: true } } }
    });
    getQueues().SvelteSSE.add(`Update Project #${res.Product.ProjectId} (transition updated)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      OTContext: null,
      projectIds: [res.Product.ProjectId]
    });
    return res;
  } catch {
    return false;
  }
}

export async function updateMany(
  updateData: Prisma.ProductTransitionsUpdateManyArgs,
  projectId: number | false
) {
  try {
    const res = await prisma.productTransitions.updateMany(updateData);
    if (projectId !== false)
      getQueues().SvelteSSE.add(`Update Project #${projectId} (transitions updated)`, {
        type: BullMQ.JobType.SvelteSSE_UpdateProject,
        OTContext: null,
        projectIds: [projectId]
      });
    return res;
  } catch {
    return false;
  }
}

export async function deleteMany(
  deleteWhere: Prisma.ProductTransitionsDeleteManyArgs,
  projectId: number
) {
  try {
    const res = await prisma.productTransitions.deleteMany(deleteWhere);
    getQueues().SvelteSSE.add(`Update Project #${projectId} (transitions deleted)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      OTContext: null,
      projectIds: [projectId]
    });
    return res;
  } catch {
    return false;
  }
}
