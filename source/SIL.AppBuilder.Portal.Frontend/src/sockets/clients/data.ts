import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory } from '@ssv/signalr-client';
import Store from '@orbit/store';

import { Socket } from './socket-client';

interface DataHub {
  Data: string;
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

    this.onData$$ = this.connection.on<string>('Data').subscribe(this.onData.bind(this));
  }

  onData(data: string) {
    console.log('data', data);
  }
}
