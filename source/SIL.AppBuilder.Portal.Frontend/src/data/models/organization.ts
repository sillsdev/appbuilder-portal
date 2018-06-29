export const TYPE_NAME = 'organization';
export interface OrganizationAttributes {
  // from an invite
  token?: string;

  // actual attributes;
  name?: string;
  websiteUrl?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
}
