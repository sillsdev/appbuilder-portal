import { Prisma } from '@prisma/client';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';

async function deleteReviewer(id: number) {
  // Get the reviewer's project
  const reviewer = await prisma.reviewers.findUnique({
    where: { Id: id }
  });
  if (!reviewer) {
    return false;
  }
  const ret = await prisma.reviewers.delete({
    where: { Id: id }
  });

  Queues.SvelteProjectSSE.add(`Update Project #${reviewer.ProjectId} (reviewer removed)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [reviewer.ProjectId]
  });
  return ret;
}

export { deleteReviewer as delete };

export async function create(reviewerData: Prisma.ReviewersUncheckedCreateInput) {
  const ret = await prisma.reviewers.create({
    data: reviewerData
  });
  Queues.SvelteProjectSSE.add(`Update Project #${reviewerData.ProjectId} (reviewer added)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [reviewerData.ProjectId]
  });
  return ret;
}
