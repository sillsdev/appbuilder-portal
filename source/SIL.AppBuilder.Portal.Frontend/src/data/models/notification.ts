import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type NOTIFICATIONS_TYPE = 'notifications';

export const TYPE_NAME = 'notification';

export interface NotificationAttributes extends AttributesObject {
  title: string;
  description: string;
  time: Date;
  link: string;
  isViewed: boolean;
  show: boolean;
}

export type NotificationResource = ResourceObject<NOTIFICATIONS_TYPE, NotificationAttributes>;