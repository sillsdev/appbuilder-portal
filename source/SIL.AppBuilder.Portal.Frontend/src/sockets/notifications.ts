import SocketClient from './socket-client';
import {HubConnectionFactory, HubConnection} from '@ssv/signalr-client';
import Store from '@orbit/store';

import {defaultOptions} from '@data';
import { buildFindRecord } from '@data/store-helpers';
const NOTIFICATION_METHOD = "Notification";

interface NotificationHub{
  Notification: number;
  TestNotification: number;
}

export default class NotificationsSocketClient implements SocketClient{
  connection$$ = null;
  notification$$ = null;
  onNotification$$ = null;

  connection: HubConnection<NotificationHub> = null;
  dataStore = null;
  init(hubFactory: HubConnectionFactory, dataStore: Store ){
    hubFactory.create({key: 'notifications', endpointUri: '/hubs/notifications'});
    this.dataStore = dataStore;
    this.connection = hubFactory.get<NotificationHub>('notifications');
    this.connection$$ = this.connection.connect()
                      .subscribe(() => {
                        console.log('notifications signalr hub connected');
                      });
    this.onNotification$$ = this.connection.on<number>(NOTIFICATION_METHOD).subscribe(this.onNotification.bind(this));
  }

  onNotification(id: number){
    const idString = id.toString();
    this.dataStore.query(q => buildFindRecord(q, 'notification', idString), {...defaultOptions()})
      .catch((err) => {
        console.error(`unable to retrieve notification for id: ${idString}`, err);
      });
  }
}
