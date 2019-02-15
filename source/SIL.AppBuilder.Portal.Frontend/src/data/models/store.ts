import { AttributesObject, ResourceObject } from 'jsonapi-typescript';
import { Record } from '@orbit/data';

export type STORES_TYPE = 'store';

export interface StoreAttributes extends AttributesObject {
  name: string;
  description: string;
}

export type StoreResource = ResourceObject<STORES_TYPE, StoreAttributes> & Record;
