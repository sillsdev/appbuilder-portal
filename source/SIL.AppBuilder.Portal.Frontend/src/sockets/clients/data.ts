import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory } from '@ssv/signalr-client';
import Store from '@orbit/store';

import { Socket } from './socket-client';

import { dataToLocalCache } from '~/data/orbitjs-operations-support/serialize-from-api';

export interface DataHub {
  RemoteDataHasUpdated: string;
  PerformOperations: string;
  SubscribeTo: string;
  UnsubscribeFrom: string;
}

export default class DataSocketClient extends Socket<DataHub> {
  onData$$: ISubscription;

  constructor(hubFactory: HubConnectionFactory, dataStore: Store) {
    super(hubFactory, {
      url: '/hubs/data',
      dataStore,
    });
  }

  start() {
    super.start();

    this.onData$$ = this.hub.on<string>('RemoteDataHasUpdated').subscribe((json: string) => {
      let data = JSON.parse(json);

      try {
        dataToLocalCache(this.dataStore, data);
      } catch (e) {
        console.error(['received data from socket', data, e]);
      }
    });
  }
}
