import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type ROLE_TYPE = 'roles';
export const TYPE_NAME = 'role';

export enum ROLE {
  SuperAdmin = 'SuperAdmin',
  OrganizationAdmin = 'OrganizationAdmin',
  AppBuilder = 'AppBuilder'
}

export interface RoleAttributes extends AttributesObject {
  roleName: string | ROLE;
}

export type RoleResource = ResourceObject<ROLE_TYPE | string, RoleAttributes>;
