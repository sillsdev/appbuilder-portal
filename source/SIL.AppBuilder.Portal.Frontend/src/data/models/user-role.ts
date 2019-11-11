import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type USER_ROLE_TYPE = 'userRole';
export const TYPE_NAME = 'user-role';
export const PLURAL_NAME = 'user-roles';

export interface UserRoleAttributes extends AttributesObject {}

export type UserRoleResource = ResourceObject<USER_ROLE_TYPE, UserRoleAttributes>;
