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
  const fromDB = parseInt(String(record?.['rate-limit'] ?? '') || 'NaN', 10);

  return isNaN(fromDB) ? 20 : fromDB;
}
