
import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type PRODUCT_DEFINITIONS_TYPE = 'productDefinition';

export interface ProductDefinitionAttributes extends AttributesObject {
  name: string;
  // type?
  // TODO: figure out better mapping for this
  //       we'll know for certain as we actually start to work with products
}

export type ProductDefinitionResource = ResourceObject<PRODUCT_DEFINITIONS_TYPE, ProductDefinitionAttributes>;
