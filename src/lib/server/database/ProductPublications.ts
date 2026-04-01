import type { Prisma } from '@prisma/client';

import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

async function deletePublication(
  ProjectId: number,
  ProductId: string,
  BuildEngineReleaseId: number
) {
  const ret = await prisma.productPublications.deleteMany({
    where: { ProductId, BuildEngineReleaseId }
  });

  if (ret.count) {
    getQueues().SvelteSSE.add(
      `Update Project #${ProjectId} (publication #${BuildEngineReleaseId} removed)`,
      {
        type: BullMQ.JobType.SvelteSSE_UpdateProject,
        projectIds: [ProjectId]
      }
    );
  }
  return !!ret.count;
}

export async function create(data: Prisma.ProductPublicationsUncheckedCreateInput) {
  const ret = await prisma.productPublications.create({
    data: data,
    select: {
      Product: {
        select: {
          ProjectId: true
        }
      }
    }
  });
  getQueues().SvelteSSE.add(
    `Update Project #${ret.Product.ProjectId} (publication #${data.BuildEngineReleaseId} added)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [ret.Product.ProjectId]
    }
  );
  return ret;
}

export async function update(
  ProductId: string,
  BuildEngineReleaseId: number,
  data: Prisma.ProductPublicationsUncheckedUpdateInput
) {
  const ret = await prisma.productPublications.update({
    where: {
      ProductId_BuildEngineReleaseId: { ProductId, BuildEngineReleaseId }
    },
    data: data,
    select: {
      Product: {
        select: {
          ProjectId: true
        }
      }
    }
  });
  getQueues().SvelteSSE.add(
    `Update Project #${ret.Product.ProjectId} (publication #${BuildEngineReleaseId} updated)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [ret.Product.ProjectId]
    }
  );
  return ret;
}

export { deletePublication as delete };
