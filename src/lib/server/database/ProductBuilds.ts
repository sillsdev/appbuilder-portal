import type { Prisma } from '@prisma/client';

import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

async function deleteBuild(ProjectId: number, ProductId: string, BuildEngineBuildId: number) {
  const ret = await prisma.productBuilds.deleteMany({
    where: { ProductId, BuildEngineBuildId }
  });

  if (ret.count) {
    getQueues().SvelteSSE.add(
      `Update Project #${ProjectId} (build #${BuildEngineBuildId} removed)`,
      {
        type: BullMQ.JobType.SvelteSSE_UpdateProject,
        projectIds: [ProjectId]
      }
    );
  }
  return !!ret.count;
}

export async function create(data: Prisma.ProductBuildsUncheckedCreateInput) {
  const ret = await prisma.productBuilds.create({
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
    `Update Project #${ret.Product.ProjectId} (build #${data.BuildEngineBuildId}} added)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [ret.Product.ProjectId]
    }
  );
  return ret;
}

export async function update(
  ProductId: string,
  BuildEngineBuildId: number,
  data: Prisma.ProductBuildsUncheckedUpdateInput
) {
  const ret = await prisma.productBuilds.update({
    where: {
      ProductId_BuildEngineBuildId: { ProductId, BuildEngineBuildId }
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
    `Update Project #${ret.Product.ProjectId} (build #${data.BuildEngineBuildId}} updated)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [ret.Product.ProjectId]
    }
  );
  return ret;
}

export { deleteBuild as delete };
