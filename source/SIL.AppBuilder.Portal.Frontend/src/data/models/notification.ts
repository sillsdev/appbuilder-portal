export const TYPE_NAME = 'notification';

export interface NotificationAttributes {
  title: String;
  description: String;
  time: Date;
  link: String;
  isViewed: boolean;
  shown: boolean;
}