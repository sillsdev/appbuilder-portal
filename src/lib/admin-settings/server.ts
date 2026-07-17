import type { JsonObject } from '@prisma/client/runtime/client';
import { DatabaseReads } from '$lib/server/database';
import { AdminSettings } from '.';

/**
 * return stored rate limit from DB (default: 20)
 */
export async function getSoftwareUpdatesRateLimit() {
  const record = (
    await DatabaseReads.adminSettings.findUnique({
      where: { Key: AdminSettings.SoftwareUpdates },
      select: {
        Value: true
      }
    })
  )?.Value as JsonObject | undefined;
  const fromDB = parseInt((record?.['rate-limit'] as string) || 'NaN', 10);

  return isNaN(fromDB) ? 20 : fromDB;
}
