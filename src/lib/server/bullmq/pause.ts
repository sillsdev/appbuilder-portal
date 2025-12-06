/**
 * Helper module for pausing and unpausing automated rebuild batches in the Build queue.
 * Key Concepts:
 * - Parent job: a marker job representing a batch of rebuilds.
 * - Child jobs: individual build jobs linked to a parent job via parentJobId.
 * - Pausing: moves the parent job to delayed state and removes all unprocessed children.
 * - Unpausing: recreates child jobs that were removed previously.
 */

import type { JobsOptions } from 'bullmq';
import { getQueues } from './queues';
import type { BuildJob } from './types';
import OTEL from '$lib/otel';

/**
 * Pauses a batch rebuild by:
 * 1. Moving the parent job to delayed (ignored by workers)
 * 2. Removing all unprocessed child jobs
 * 3. Storing metadata so they can be recreated
 */
export async function pauseRebuild(parentJobId: string) {
  const { Builds } = getQueues();
  const parentJob = await Builds.getJob(parentJobId);
  if (!parentJob) throw new Error(`Parent job ${parentJobId} not found`);

  OTEL.instance.logger.info(`Pausing rebuild for parent job ${parentJobId}`);

  // --- 1. Read children BEFORE removing them ---
  const children = await parentJob.getChildrenValues<{
    name: string;
    data: BuildJob;
    opts?: JobsOptions;
  }>();

  // children is an object keyed by childJobId → { name, data, opts }
  const removedChildren = Object.values(children);

  // --- 2. Remove all unprocessed child jobs ---
  const allJobs = await Builds.getJobs(['waiting', 'delayed']);
  const childJobs = allJobs.filter((job) => job.opts?.parent?.id === parentJobId);

  for (const job of childJobs) {
    await job.remove();
  }

  // --- 3. Move parent to delayed ---
  await parentJob.moveToDelayed(Date.now() + 24 * 3600 * 1000);

  OTEL.instance.logger.info(`Paused rebuild: removed ${removedChildren.length} children`);

  return removedChildren; // return so unpauseRebuild can accept it
}

/**
 * Unpauses a batch rebuild by:
 * 1. Promoting parent to waiting
 * 2. Recreating child jobs using stored metadata
 */
export async function unpauseRebuild(
  parentJobId: string,
  removedChildren: {
    name: string;
    data: BuildJob;
    opts?: JobsOptions;
  }[]
) {
  const { Builds } = getQueues();
  const parentJob = await Builds.getJob(parentJobId);
  if (!parentJob) throw new Error(`Parent job ${parentJobId} not found`);

  OTEL.instance.logger.info(
    `Unpausing rebuild for ${parentJobId} – recreating ${removedChildren.length} children`
  );

  // --- 1. Promote parent ---
  await parentJob.promote();

  // --- 2. Recreate child jobs ---
  if (removedChildren.length > 0) {
    await Builds.addBulk(
      removedChildren.map((c) => ({
        name: c.name,
        data: c.data,
        opts: {
          ...c.opts,
          parent: {
            id: parentJobId,
            queue: Builds.name
          }
        }
      }))
    );
  }

  OTEL.instance.logger.info(`Unpaused rebuild: restored ${removedChildren.length} child jobs`);

  return removedChildren.length;
}
