import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type NOTIFICATIONS_TYPE = 'notifications';

export const TYPE_NAME = 'notification';

export interface NotificationAttributes extends AttributesObject {
  message: string;
  dateRead: string | null;
  dateEmailSent: string | null;
  dateCreated: string;
  dateUpdated: string;


}

export type NotificationResource = ResourceObject<NOTIFICATIONS_TYPE, NotificationAttributes>;
