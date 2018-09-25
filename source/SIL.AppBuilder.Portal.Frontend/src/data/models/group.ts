import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type GROUPS_TYPE = 'groups';
export const TYPE_NAME = 'group';
export const PLURAL_NAME = 'groups';

export interface GroupAttributes extends AttributesObject {
  name: string;
  abbreviation: string;
}

export type GroupResource = ResourceObject<GROUPS_TYPE, GroupAttributes>;
