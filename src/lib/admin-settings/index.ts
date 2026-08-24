import * as v from 'valibot';

export const AdminSettings = {
  SoftwareUpdates: 'software-updates',
  Projects: 'projects'
} as const;
export type AdminSetting = (typeof AdminSettings)[keyof typeof AdminSettings];

export const AdminSettingsKeys = {
  [AdminSettings.SoftwareUpdates]: {
    RateLimit: 'rate-limit',
    AllowOrgs: 'allow-orgs'
  },
  [AdminSettings.Projects]: {
    ShowRepoURL: 'org-show-repo-url'
  }
} as const satisfies Record<AdminSetting, Record<string, string>>;

const whitelist = v.optional(v.union([v.array(v.number()), v.picklist(['all'])]), []);

export const defaultSoftwareUpdatesRateLimit = 20;

export const softwareUpdatesParametersSchema = v.strictObject({
  [AdminSettingsKeys[AdminSettings.SoftwareUpdates].RateLimit]: v.optional(
    v.number(),
    defaultSoftwareUpdatesRateLimit
  ),
  [AdminSettingsKeys[AdminSettings.SoftwareUpdates].AllowOrgs]: whitelist
});

export const projectsParametersSchema = v.strictObject({
  [AdminSettingsKeys[AdminSettings.Projects].ShowRepoURL]: whitelist
});

export function getSchemaForSetting(setting: string) {
  switch (setting) {
    case AdminSettings.SoftwareUpdates:
      return v.nullish(softwareUpdatesParametersSchema);
    case AdminSettings.Projects:
      return v.nullish(projectsParametersSchema);
    default:
      return v.nullable(v.looseObject({}));
  }
}
