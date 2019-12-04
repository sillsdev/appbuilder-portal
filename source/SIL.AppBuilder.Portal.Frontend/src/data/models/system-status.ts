import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type SYSTEM_STATUSES_TYPE = 'systemStatus';
export const PLURAL_NAME = 'system-statuses';

export interface SystemStatusAttributes extends AttributesObject {
  buildEngineUrl: string;
  buildEngineApiAccessToken: string;
  systemAvailable?: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export type SystemStatusResource = ResourceObject<SYSTEM_STATUSES_TYPE, SystemStatusAttributes>;
