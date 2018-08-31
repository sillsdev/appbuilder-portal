import { AttributesObject } from "jsonapi-typescript";

export const TYPE_NAME = 'notification';

export interface NotificationAttributes extends AttributesObject {
  title: string;
  description: string;
  time: Date;
  link: string;
  isViewed: boolean;
  show: boolean;
}
