export const TYPE_NAME = 'organization';

export interface OrganizationAttributes {
  // from an invite
  token?: string;

  // fake properties for updating / creating
  logo?: string;

  // actual attributes;
  name?: string;
  websiteUrl?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
  makePrivateByDefault?: boolean;
  useSilBuildInfrastructure?: boolean;

  // TODO: maybe make a transform for this to convert to base64
  //      upon reading the logo property.
  // TODO: find out if we can define custom getters and setters on 'Models'
  logoUrl?: string;
}
