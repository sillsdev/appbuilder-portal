import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type AUTHORS_TYPE = 'authors';

export const AUTHOR_NAME = 'author';
export const PLURAL_NAME = 'authors';

export interface AuthorAttributes extends AttributesObject {}

export type AuthorResource = ResourceObject<AUTHORS_TYPE, AuthorAttributes>;
