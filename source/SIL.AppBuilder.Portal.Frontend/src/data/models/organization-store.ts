import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type ORGANIZATION_STORES_TYPE = 'organization-stores';

export const TYPE_NAME = 'organization-store';
export const PLURAL_NAME = 'organization-stores';

export interface OrganizationStoreAttributes extends AttributesObject { }

export type OrganizationStoreResource = ResourceObject<ORGANIZATION_STORES_TYPE, OrganizationStoreAttributes>;