import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type ORGANIZATIONS_TYPE = 'organizations';
export const TYPE_NAME = 'organization';

export interface OrganizationAttributes extends AttributesObject {
  // from an invite
  token?: string;

  // actual attributes;
  name?: string;
  websiteUrl?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
  publicByDefault?: boolean;
  useDefaultBuildEngine?: boolean;
  logoUrl?: string;
}

export type OrganizationResource = ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
