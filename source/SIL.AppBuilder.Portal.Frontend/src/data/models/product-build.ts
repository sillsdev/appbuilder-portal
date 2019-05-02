import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type PRODUCT_BUILD_TYPE = 'productBuild';

export interface ProductBuildAttributes extends AttributesObject {
  version: string;
  success?: boolean;
  buildId: number;
  dateCreated: string;
  dateUpdated: string;
}

export type ProductBuildResource = ResourceObject<PRODUCT_BUILD_TYPE, ProductBuildAttributes>;
