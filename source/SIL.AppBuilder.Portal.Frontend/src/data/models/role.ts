import { AttributesObject, ResourceObject } from 'jsonapi-typescript';
import { Record } from '@orbit/data';

export type ROLE_TYPE = 'roles';
export const TYPE_NAME = 'role';

export enum ROLE {
  SuperAdmin = 'SuperAdmin',
  OrganizationAdmin = 'OrganizationAdmin',
  AppBuilder = 'AppBuilder',
  Author = 'Author',
}

export interface RoleAttributes extends AttributesObject {
  roleName: string | ROLE;
}

export type RoleResource = ResourceObject<ROLE_TYPE | string, RoleAttributes> & Record;
