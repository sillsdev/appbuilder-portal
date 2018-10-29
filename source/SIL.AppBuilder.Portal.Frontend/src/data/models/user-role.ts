import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type USER_ROLE_TYPE = 'userRole';
export const TYPE_NAME = 'user-role';

export interface UserRoleAttributes extends AttributesObject {
}

export type UserRoleResource = ResourceObject<USER_ROLE_TYPE, UserRoleAttributes>;
