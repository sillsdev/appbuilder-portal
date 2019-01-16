import { HubConnectionFactory, HubConnection } from '@ssv/signalr-client';
import { LogLevel, HttpTransportType } from '@aspnet/signalr';
import Store from '@orbit/store';

import { defaultOptions } from '@data';

import { buildFindRecord } from '@data/store-helpers';
import { getToken } from '@lib/auth0';

import SocketClient from './socket-client';
const NOTIFICATION_METHOD = 'Notification';

interface NotificationHub {
  Notification: number;
  TestNotification: number;
}

export default class NotificationsSocketClient implements SocketClient {
  connection$$ = null;
  notification$$ = null;
  onNotification$$ = null;

  connection: HubConnection<NotificationHub> = null;
  dataStore = null;
  init(hubFactory: HubConnectionFactory, dataStore: Store) {
    hubFactory.create({
      key: 'notifications',
      endpointUri: '/hubs/notifications',
      options: {
        accessTokenFactory: () => `${getToken()}`,
        logger: LogLevel.Trace,
        // tslint:disable-next-line:no-bitwise
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.ServerSentEvents |
          HttpTransportType.LongPolling,
      },
    });
    this.dataStore = dataStore;
    this.connection = hubFactory.get<NotificationHub>('notifications');
  }

  start() {
    this.connection$$ = this.connection
      .connect()
      .subscribe(
        () => console.log('notifications signalr hub connected'),
        (err) => console.error('connect subscription has error', err),
        () => console.log('completed')
      );
    this.onNotification$$ = this.connection
      .on<number>(NOTIFICATION_METHOD)
      .subscribe(this.onNotification.bind(this));
  }
  stop() {
    this.onNotification$$.unsubscribe();
    this.connection$$.unsubscribe();
    this.connection.disconnect();
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
