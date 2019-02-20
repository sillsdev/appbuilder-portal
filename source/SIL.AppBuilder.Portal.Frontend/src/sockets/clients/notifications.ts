import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory } from '@ssv/signalr-client';
import Store from '@orbit/store';

import { defaultOptions } from '@data';

import { buildFindRecord } from '@data/store-helpers';

import { Socket } from './socket-client';
import { QueryBuilder } from '@orbit/data';

const NOTIFICATION_METHOD = 'Notification';

interface NotificationHub {
  Notification: number;
  TestNotification: number;
}

export default class NotificationsSocketClient extends Socket<NotificationHub> {
  onNotification$$: ISubscription;

  constructor(hubFactory: HubConnectionFactory, dataStore: Store) {
    super(hubFactory, {
      url: '/hubs/notifications',
      dataStore,
    });
  }

  start() {
    super.start();

    this.onNotification$$ = this.connection
      .on<number>(NOTIFICATION_METHOD)
      .subscribe(this.onNotification.bind(this));
  }

  onNotification(id: number) {
    const idString = id.toString();
    this.dataStore
      .query((q) => buildFindRecord(q, 'notification', idString), { ...defaultOptions() })
      .catch((err) => {
        console.error(`unable to retrieve notification for id: ${idString}`, err);
      });
  }
}
