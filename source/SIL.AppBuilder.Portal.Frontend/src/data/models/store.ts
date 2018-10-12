import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type STORES_TYPE = 'store';

export interface StoreAttributes extends AttributesObject {
  name: string;
  description: string;
}

export type StoreResource = ResourceObject<STORES_TYPE, StoreAttributes>;
