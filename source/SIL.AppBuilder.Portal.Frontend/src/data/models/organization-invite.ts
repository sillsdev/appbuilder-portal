export const TYPE_NAME = 'organizationInvite';

export interface OrganizationInviteAttributes {
  name?: string;
  ownerEmail?: string;
  url?: string;
  expiresAt?: Date;
}

export interface RequestAccessForOrganizationAttributes {
  name: string;
  orgAdminEmail: string;
  websiteUrl: string;
}
