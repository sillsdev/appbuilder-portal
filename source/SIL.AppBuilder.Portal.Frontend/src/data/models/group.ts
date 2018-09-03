import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'group';
export const PLURAL_NAME = 'groups';

export interface GroupAttributes extends AttributesObject {
  name: string;
  abbreviation: string;
}
