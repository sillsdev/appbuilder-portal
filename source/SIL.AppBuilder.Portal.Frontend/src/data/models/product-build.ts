import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type PRODUCT_BUILD_TYPE = 'productBuild';

export interface ProductBuildAttributes extends AttributesObject {
  artifactType: string;
  url: string;
  version: string;
  fileSize: number;
  contentType: string;
  dateCreated: string;
  dateUpdated: string;


}

export type ProductBuildResource = ResourceObject<PRODUCT_BUILD_TYPE, ProductBuildAttributes>;
