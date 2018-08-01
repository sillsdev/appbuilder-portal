export const TYPE_NAME = 'notification';

export interface NotificationAttributes {
  title: string;
  description: string;
  time: Date;
  link: string;
  isViewed: boolean;
  show: boolean;
}
