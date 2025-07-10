import { Prisma } from '@prisma/client';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';

async function deleteAuthor(id: number) {
  // Get the author's project
  const author = await prisma.authors.findUnique({
    where: { Id: id }
  });
  if (!author) {
    return false;
  }
  const ret = await prisma.authors.delete({
    where: { Id: id }
  });

  Queues.SvelteProjectSSE.add(`Update Project #${author.ProjectId} (author removed)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [author.ProjectId]
  });
  return ret;
}

export async function create(authorData: Prisma.AuthorsUncheckedCreateInput) {
  const ret = await prisma.authors.create({
    data: authorData
  });
  Queues.SvelteProjectSSE.add(`Update Project #${authorData.ProjectId} (author added)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [authorData.ProjectId]
  });
  return ret;
}
export { deleteAuthor as delete };
