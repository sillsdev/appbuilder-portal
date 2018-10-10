import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type ORGANIZATION_PRODUCT_DEFINITIONS_TYPE = 'organization-product-definitions';

export const TYPE_NAME = 'organization-product-definition';
export const PLURAL_NAME = 'organization-product-definitions';

export interface OrganizationProductDefinitionAttributes extends AttributesObject {}

export type OrganizationProductDefinitionResource = ResourceObject<ORGANIZATION_PRODUCT_DEFINITIONS_TYPE, OrganizationProductDefinitionAttributes>;