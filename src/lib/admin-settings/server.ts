import * as v from 'valibot';
import {
  AdminSettings,
  AdminSettingsKeys,
  defaultSoftwareUpdatesRateLimit,
  projectsParametersSchema,
  softwareUpdatesParametersSchema
} from '$lib/admin-settings';
import { DatabaseReads } from '$lib/server/database';

async function getSoftwareUpdatesSettings() {
  return v.safeParse(
    v.pipe(v.nullish(v.string(), ''), v.parseJson(), softwareUpdatesParametersSchema),
    (
      await DatabaseReads.adminSettings.findUnique({
        where: { Key: AdminSettings.SoftwareUpdates },
        select: {
          Value: true
        }
      })
    )?.Value
  );
}

/**
 * return stored rate limit from DB (default: 20)
 */
export async function getSoftwareUpdatesRateLimit() {
  const record = await getSoftwareUpdatesSettings();

  return record.success
    ? record.output[AdminSettingsKeys[AdminSettings.SoftwareUpdates].RateLimit]
    : defaultSoftwareUpdatesRateLimit;
}

export async function getSoftwareUpdatesWhitelist() {
  const record = await getSoftwareUpdatesSettings();
  return record.success
    ? record.output[AdminSettingsKeys[AdminSettings.SoftwareUpdates].AllowOrgs]
    : [];
}

async function getProjectsSettings() {
  return v.safeParse(
    v.pipe(v.nullish(v.string(), ''), v.parseJson(), projectsParametersSchema),
    (
      await DatabaseReads.adminSettings.findUnique({
        where: { Key: AdminSettings.Projects },
        select: {
          Value: true
        }
      })
    )?.Value
  );
}

export async function getProjectRepoURLWhitelist() {
  const record = await getProjectsSettings();
  return record.success ? record.output[AdminSettingsKeys[AdminSettings.Projects].ShowRepoURL] : [];
}
