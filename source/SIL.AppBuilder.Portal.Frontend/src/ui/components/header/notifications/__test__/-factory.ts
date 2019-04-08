import moment from 'moment';
import { sortBy, reverse } from 'lodash';

const protoNotification = {
  attributes: {
    'date-read': null,
    'date-email-sent': null,
    'date-created': '2018-12-13T18:21:49.254195',
    'date-updated': '2018-12-13T18:21:49.254195',
    message: 'a new notification',
    'send-email': false,
  },
  relationships: {
    user: {
      data: {
        type: 'users',
        id: '11',
      },
    },
  },
  type: 'notifications',
  id: '65',
};

const protoMeta = {
  'total-records': 4,
};

function getRandomTimeAgo() {
  const offsetHours = Math.floor(Math.random() * 48);

  return moment()
    .add(-offsetHours, 'hours')
    .toISOString();
}

interface INotificationForOptions {
  id: number | string;
  time: string;
  unread?: boolean;
  userId?: number | string;
}

function notificationFor({ id, time, unread, userId }: INotificationForOptions) {
  unread = unread || false;

  const notification = { ...protoNotification, id: id.toString() };
  notification.attributes = {
    ...notification.attributes,
    'date-created': time,
    'date-updated': time,
  };

  if (!unread) {
    notification.attributes['date-read'] = time;
  }

  if (userId) {
    notification.relationships.user.data.id = userId.toString();
  }

  return notification;
}

export function notifications(n: number, unreadCount?: number, userId?: number): any {
  const result = [];

  if (unreadCount === undefined) {
    unreadCount = Math.floor(n / 2);
  }

  let i = 0;

  for (i; i < n; ++i) {
    const t = moment()
      .add(-i, 'hours')
      .toISOString();
    result.push(notificationFor({ id: i, time: t, unread: i < unreadCount, userId }));
  }

  return reverse(sortBy(result, ['attributes.date-created', 'attributes.date-read']));
}
