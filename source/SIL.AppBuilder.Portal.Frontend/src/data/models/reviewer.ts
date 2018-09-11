import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'reviewer';
export const PLURAL_NAME = 'reviewers';

export interface ReviewerAttributes extends AttributesObject {
  name: string;
  email: string;
}