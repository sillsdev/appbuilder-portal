import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type PRODUCT_ARTIFACTS_TYPE = 'productArtifact';

export interface ProductArtifactAttributes extends AttributesObject {
  artifactType: string;
  url: string;
  fileSize: number;
  contentType: string;
  dateCreated: string;
  dateUpdated: string;
}

export type ProductArtifactResource = ResourceObject<
  PRODUCT_ARTIFACTS_TYPE,
  ProductArtifactAttributes
>;
