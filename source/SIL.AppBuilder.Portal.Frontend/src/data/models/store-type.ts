import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type STORE_TYPES_TYPE = 'store-types';
export type TYPE_NAME = 'store-type';

export interface StoreTypeAttributes extends AttributesObject {
  name: string;
  description: string;
}

export type StoreTypeResource = ResourceObject<STORE_TYPES_TYPE, StoreTypeAttributes>;
