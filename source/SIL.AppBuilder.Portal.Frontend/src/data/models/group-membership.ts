import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type GROUP_MEMBERSHIPS_TYPE = 'group-memberships';

export const TYPE_NAME = 'group-membership';
export const PLURAL_NAME = 'group-memberships';

export interface GroupMembershipAttributes extends AttributesObject {}

export type GroupMembershipResource = ResourceObject<
  GROUP_MEMBERSHIPS_TYPE,
  GroupMembershipAttributes
>;
