import * as v from 'valibot';

export const AdminSettings = {
  SoftwareUpdates: 'software-updates'
} as const;

export const defaultSoftwareUpdatesRateLimit = 20;

export const softwareUpdatesParametersSchema = v.looseObject({
  'rate-limit': v.optional(v.number(), defaultSoftwareUpdatesRateLimit)
});
