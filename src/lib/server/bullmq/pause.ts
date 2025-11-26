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
import OTEL from '$lib/otel';

interface RemovedChildJobData {
    name: string;
    data: any;
    opts?: JobsOptions;
}


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
    const metadata = (parentJob.data as Record<string, any>)._metadata ?? {};


    OTEL.instance.logger.info(`Pausing rebuild for parent job ${parentJobId}`);

    // Get all potential child jobs
    const allJobs = await Builds.getJobs(['waiting', 'delayed']); // active not included as it's being processed
    const childJobs = allJobs.filter(job => job.opts?.parent?.id === parentJobId);

    const removedChildren: RemovedChildJobData[] = [];

    for (const job of childJobs) {
        removedChildren.push({
            name: job.name,
            data: job.data,
            opts: job.opts
        });
        await job.remove();
    }

    await parentJob.updateData({
        ...(parentJob.data as any),
        _metadata: {
            ...((parentJob.data as any)._metadata ?? {}),
            removedChildren
        }
    } as any);




    // Move to delayed state (24h)
    await parentJob.moveToDelayed(Date.now() + 24 * 3600 * 1000);

    OTEL.instance.logger.info(`Paused rebuild: removed ${removedChildren.length} child jobs`);
}


/**
 * Unpauses a batch rebuild by:
 * 1. Promoting parent to waiting
 * 2. Recreating child jobs using stored metadata
 */
export async function unpauseRebuild(parentJobId: string) {
    const { Builds } = getQueues();
    const parentJob = await Builds.getJob(parentJobId);

    if (!parentJob) throw new Error(`Parent job ${parentJobId} not found`);

    const removedChildren: RemovedChildJobData[] =
        ((parentJob.data as Record<string, any>)._metadata?.removedChildren) ?? [];

    OTEL.instance.logger.info(
        `Unpausing rebuild for ${parentJobId} – recreating ${removedChildren.length} child jobs`
    );

    await parentJob.promote();

    if (removedChildren.length > 0) {
        await Builds.addBulk(
            removedChildren.map(c => ({
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

        // Clear metadata to avoid repeated restores
        await parentJob.updateData({
            ...(parentJob.data as any),
            _metadata: {}  // safely clear metadata
        } as any);

    }


    OTEL.instance.logger.info(`Unpaused rebuild: restored ${removedChildren.length} child jobs`);
    return removedChildren.length;
}
