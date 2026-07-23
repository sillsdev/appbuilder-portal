import { DatabaseReads } from '$lib/server/database';
import { AdminSettings } from '.';

/**
 * return stored rate limit from DB (default: 20)
 */
export async function getSoftwareUpdatesRateLimit() {
  const record = JSON.parse(
    (
      await DatabaseReads.adminSettings.findUnique({
        where: { Key: AdminSettings.SoftwareUpdates },
        select: {
          Value: true
        }
      })
    )?.Value || '{}'
  );

  return record?.['rate-limit'] ?? 20;
}
