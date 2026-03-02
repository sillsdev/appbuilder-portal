import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import { WorkflowState } from '$lib/workflowTypes';

export async function create(createData: Prisma.ProductTransitionsCreateArgs) {
  try {
    const res = await prisma.productTransitions.create({
      ...createData,
      include: { Product: { select: { ProjectId: true } } }
    });
    getQueues().SvelteSSE.add(`Update Project #${res.Product.ProjectId} (transition created)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
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
      projectIds: [projectId]
    });
    return res;
  } catch {
    return false;
  }
}

export async function tryConnect(
  productId: string,
  buildOrReleaseId: number,
  scope: 'build' | 'release',
  transitionId?: number | null
) {
  try {
    if (transitionId) {
      await prisma.$transaction(async (tx) => {
        const transition = await tx.productTransitions.findFirst({
          where: { Id: transitionId, ProductId: productId },
          select: { InitialState: true }
        });

        if (scope === 'build' && transition?.InitialState === WorkflowState.Product_Build) {
          return await tx.productBuilds.updateMany({
            where: { ProductId: productId, BuildEngineBuildId: buildOrReleaseId },
            data: {
              TransitionId: transitionId
            }
          });
        } else if (
          scope === 'release' &&
          transition?.InitialState === WorkflowState.Product_Publish
        ) {
          return await tx.productPublications.updateMany({
            where: { ProductId: productId, BuildEngineReleaseId: buildOrReleaseId },
            data: {
              TransitionId: transitionId
            }
          });
        }
      });
    }
  } catch {
    /* empty */
  }
}
