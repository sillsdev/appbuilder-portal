
import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type PRODUCT_DEFINITIONS_TYPE = 'productDefinition';

export interface ProductDefinitionAttributes extends AttributesObject {
  name: string;
}

export type ProductDefinitionResource = ResourceObject<PRODUCT_DEFINITIONS_TYPE, ProductDefinitionAttributes>;
