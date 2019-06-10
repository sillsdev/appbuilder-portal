import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type PRODUCT_PUBLICATION_TYPE = 'productPublication';

export interface ProductPublicationAttributes extends AttributesObject {
  channel: string;
  success?: boolean;
  releaseId: number;
  logUrl: string;
  dateCreated: string;
  dateUpdated: string;
}

export type ProductPublisheResource = ResourceObject<
  PRODUCT_PUBLICATION_TYPE,
  ProductPublicationAttributes
>;
