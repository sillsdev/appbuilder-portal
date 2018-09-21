import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'organizationInvite';

export interface OrganizationInviteAttributes extends AttributesObject {
  name?: string;
  ownerEmail?: string;
  url?: string;
  expiresAt?: string;
}

export interface RequestAccessForOrganizationAttributes extends AttributesObject {
  name: string;
  orgAdminEmail: string;
  websiteUrl: string;
}
