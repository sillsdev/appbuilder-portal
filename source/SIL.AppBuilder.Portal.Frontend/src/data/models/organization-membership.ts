import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type ORGANIZATION_MEMBERSHIPS_TYPE = 'organization-memberships';

export const TYPE_NAME = 'organization-membership';
export const PLURAL_NAME = 'organization-memberships';

export interface OrganizationMembershipAttributes extends AttributesObject {}

export type OrganizationMembershipResource = ResourceObject<
  ORGANIZATION_MEMBERSHIPS_TYPE,
  OrganizationMembershipAttributes
>;
