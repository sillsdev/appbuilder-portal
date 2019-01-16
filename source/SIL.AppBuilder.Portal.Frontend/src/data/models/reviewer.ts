import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type REVIEWERS_TYPE = 'reviewers';

export const TYPE_NAME = 'reviewer';
export const PLURAL_NAME = 'reviewers';

export interface ReviewerAttributes extends AttributesObject {
  name: string;
  email: string;
}

export type ReviewerResource = ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>;
