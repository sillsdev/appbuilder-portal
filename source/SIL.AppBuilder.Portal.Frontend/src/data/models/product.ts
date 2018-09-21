import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type PRODUCTS_TYPE = 'products';


export const TYPE_NAME = 'product';
export const PLURAL_NAME = 'products';

export interface ProductAttributes extends AttributesObject {
  name: string;
  // type?
  // TODO: figure out better mapping for this
  //       we'll know for certain as we actually start to work with products
}

export type ProductResource = ResourceObject<PRODUCTS_TYPE, ProductAttributes>;