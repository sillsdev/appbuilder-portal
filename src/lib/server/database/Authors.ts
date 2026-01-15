import type { Prisma } from '@prisma/client';

import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

async function deleteAuthor(ProjectId: number, UserId: number) {
  const ret = await prisma.authors.deleteMany({
    where: { ProjectId, UserId }
  });

  if (ret.count) {
    getQueues().SvelteSSE.add(`Update Project #${ProjectId} (author #${UserId} removed)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [ProjectId]
    });
  }
  return !!ret.count;
}

export async function create(authorData: Prisma.AuthorsUncheckedCreateInput) {
  const ret = await prisma.authors.create({
    data: authorData
  });
  getQueues().SvelteSSE.add(
    `Update Project #${authorData.ProjectId} (author #${authorData.UserId} added)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [authorData.ProjectId]
    }
  );
  return ret;
}
export { deleteAuthor as delete };
