import * as v from 'valibot';
import {
  AdminSettings,
  defaultSoftwareUpdatesRateLimit,
  softwareUpdatesParametersSchema
} from '$lib/admin-settings';
import { DatabaseReads } from '$lib/server/database';
import { transformStringToJSON } from '$lib/valibot';

/**
 * return stored rate limit from DB (default: 20)
 */
export async function getSoftwareUpdatesRateLimit() {
  const record = v.safeParse(
    v.pipe(v.nullish(v.string(), ''), transformStringToJSON, softwareUpdatesParametersSchema),
    (
      await DatabaseReads.adminSettings.findUnique({
        where: { Key: AdminSettings.SoftwareUpdates },
        select: {
          Value: true
        }
      })
    )?.Value
  );

  return record.success ? record.output['rate-limit'] : defaultSoftwareUpdatesRateLimit;
}
