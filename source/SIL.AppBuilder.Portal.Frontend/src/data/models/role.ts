import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'role';

export interface RoleAttributes extends AttributesObject {
  name: string;
}