import * as v from 'valibot';

export const AdminSettings = {
  SoftwareUpdates: 'software-updates'
} as const;
export type AdminSetting = (typeof AdminSettings)[keyof typeof AdminSettings];

export const AdminSettingsKeys = {
  [AdminSettings.SoftwareUpdates]: {
    RateLimit: 'rate-limit',
    AllowOrgs: 'allow-orgs'
  }
} as const;

export const defaultSoftwareUpdatesRateLimit = 20;

export const softwareUpdatesParametersSchema = v.strictObject({
  [AdminSettingsKeys[AdminSettings.SoftwareUpdates].RateLimit]: v.optional(
    v.number(),
    defaultSoftwareUpdatesRateLimit
  ),
  [AdminSettingsKeys[AdminSettings.SoftwareUpdates].AllowOrgs]: v.optional(
    v.union([v.array(v.number()), v.picklist(['all'])])
  )
});

export function getSchemaForSetting(setting: string) {
  switch (setting) {
    case AdminSettings.SoftwareUpdates:
      return v.nullish(softwareUpdatesParametersSchema);
    default:
      return v.nullable(v.looseObject({}));
  }
}
