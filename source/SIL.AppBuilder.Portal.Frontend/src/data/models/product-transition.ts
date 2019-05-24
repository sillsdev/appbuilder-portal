import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type PRODUCT_TRANSITION_TYPE = 'productTransition';

export interface ProductTransitionAttributes extends AttributesObject {
  allowedUserNames?: string;
  initialState?: string;
  destinationState?: string;
  command?: string;
  comment?: string;
  dateTransition?: string;
}

export type ProductTransitionResource = ResourceObject<PRODUCT_TRANSITION_TYPE, ProductTransitionAttributes>;
