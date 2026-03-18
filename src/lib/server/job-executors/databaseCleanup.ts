import type { Job } from 'bullmq';
import type { BullMQ } from '../bullmq';
import { DatabaseWrites } from '../database';

export async function databaseCleanupWorker(
  job: Job<BullMQ.UserDataManagement.Cleanup>
): Promise<void> {
  // This job cleans up old email verification requests that are past their expiration date. It runs every night.

  // TODO: Determine if we want to only delete instances where the DateConfirmed is null. If we use this record to track confirmed requests that haven't actually had their data deleted yet, we might want to keep the record until the data is deleted, even if it's past the expiration date. For now, we'll assume that once it's past the expiration date, we can delete it regardless of whether it was confirmed or not.
  await DatabaseWrites.productUserChanges.deleteMany({
    where: {
      DateExpires: {
        lt: new Date()
      }
    }
  });
}
