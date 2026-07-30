import * as v from 'valibot';

export const AdminSettings = {
  SoftwareUpdates: {
    Key: 'software-updates',
    RateLimit: 'rate-limit',
    AllowOrgs: 'allow-orgs'
  }
} as const;
export type AdminSetting = (typeof AdminSettings)[keyof typeof AdminSettings]['Key'];

export const defaultSoftwareUpdatesRateLimit = 20;

export const softwareUpdatesParametersSchema = v.strictObject({
  'rate-limit': v.optional(v.number(), defaultSoftwareUpdatesRateLimit),
  'allow-orgs': v.optional(v.union([v.array(v.number()), v.picklist(['all'])]))
});

export function getSchemaForSetting(setting: string) {
  switch (setting) {
    case AdminSettings.SoftwareUpdates.Key:
      return v.nullish(softwareUpdatesParametersSchema);
    default:
      return v.nullable(v.looseObject({}));
  }
}
