import type { Job } from 'bullmq';
import type { BullMQ } from '../../bullmq';
import { DatabaseWrites } from '../../database';

export async function cleanup(job: Job<BullMQ.System.CleanupExpiredData>): Promise<number> {
  const result = await DatabaseWrites.productUserChanges.deleteMany({
    where: {
      DateConfirmed: null,
      DateExpires: {
        lt: new Date()
      }
    }
  });

  await job.updateProgress(100);
  return result.count;
}
