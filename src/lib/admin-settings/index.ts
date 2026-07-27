import * as v from 'valibot';

export const AdminSettings = {
  SoftwareUpdates: 'software-updates'
} as const;
export type AdminSetting = (typeof AdminSettings)[keyof typeof AdminSettings];

export const defaultSoftwareUpdatesRateLimit = 20;

export const softwareUpdatesParametersSchema = v.looseObject({
  'rate-limit': v.optional(v.number(), defaultSoftwareUpdatesRateLimit)
});

export function getSchemaForSetting(setting: string) {
  switch (setting) {
    case AdminSettings.SoftwareUpdates:
      return v.nullish(softwareUpdatesParametersSchema);
    default:
      return v.nullable(v.looseObject({}));
  }
}
