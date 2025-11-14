/**
 * Helper module for pausing and unpausing automated rebuild batches in the Build queue.
 * Key Concepts:
 * - Parent job: a marker job representing a batch of rebuilds.
 * - Child jobs: individual build jobs linked to a parent job via parentJobId.
 * - Pausing: moves the parent job to delayed state and removes all unprocessed children.
 * - Unpausing: recreates child jobs that were removed previously.
 */
