import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory } from '@ssv/signalr-client';
import Store from '@orbit/store';
import { pushPayload } from 'react-orbitjs';

import { Socket } from './socket-client';

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

    this.onData$$ = this.connection
      .on<string>('RemoteDataHasUpdated')
      .subscribe(this.onData.bind(this));
  }

  onData(json: string) {
    let data = JSON.parse(json);

    pushPayload(this.dataStore, data);
  }
}
