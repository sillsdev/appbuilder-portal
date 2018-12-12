import { AttributesObject, ResourceObject } from "jsonapi-typescript";

export type NOTIFICATIONS_TYPE = 'notifications';

export const TYPE_NAME = 'notification';

export interface NotificationAttributes extends AttributesObject {
  messageId: string;
  message: string;
  dateRead: string | null;
  dateEmailSent: string;
  dateCreated: string;
  dateUpdated: string;
  messageSubstitutions: {[key: string]: string};
}

export type NotificationResource = ResourceObject<NOTIFICATIONS_TYPE, NotificationAttributes>;
