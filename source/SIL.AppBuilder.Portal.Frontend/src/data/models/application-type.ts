import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type APPLICATION_TYPES_TYPE = 'application-types';
export const TYPE_NAME = 'application-type';
export const PLURAL_NAME = 'application-types';

export interface ApplicationTypeAttributes extends AttributesObject {
  name: string;
  description: string;
}

export type ApplicationTypeResource = ResourceObject<
  APPLICATION_TYPES_TYPE,
  ApplicationTypeAttributes
>;
