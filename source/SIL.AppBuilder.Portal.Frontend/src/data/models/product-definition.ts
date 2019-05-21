import { AttributesObject, ResourceObject } from 'jsonapi-typescript';
import { Record } from '@orbit/data';

export type PRODUCT_DEFINITIONS_TYPE = 'productDefinition';

export interface ProductDefinitionAttributes extends AttributesObject {
  name: string;
  description: string;
}

export type ProductDefinitionResource = ResourceObject<
  PRODUCT_DEFINITIONS_TYPE,
  ProductDefinitionAttributes
> & Record;
