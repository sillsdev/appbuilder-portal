import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory, HubConnection } from '@ssv/signalr-client';
import { LogLevel, HttpTransportType } from '@aspnet/signalr';
import Store from '@orbit/store';
import { getToken } from '@lib/auth0';
import { Observable } from 'rxjs';

export interface SocketClient {
  start(): void;
  stop(): void;
}

export interface ISocketOptions {
  url: string;
  dataStore: Store;
  hubOptions?: object;
}

export class Socket<THub> {
  hubFactory: HubConnectionFactory;
  hubName: string;
  hub: HubConnection<THub>;
  connection$$: Observable<void>;
  dataStore: Store;

  constructor(hubFactory, _options?: ISocketOptions) {
    this.hubFactory = hubFactory;

    const options: Partial<ISocketOptions> = _options || {};
    this.hubName = options.url;

    const factoryOptions = {
      key: this.hubName,
      endpointUri: options.url,
      options: {
        accessTokenFactory: () => `${getToken()}`,
        logger: LogLevel.Warning,
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.ServerSentEvents |
          HttpTransportType.LongPolling,

        ...(options.hubOptions || {}),
      },
    };

    hubFactory.create(factoryOptions);

    this.dataStore = options.dataStore;
    this.hub = hubFactory.get(this.hubName);
  }

  start() {
    this.connection$$ = this.hub.connect();

    this.connection$$.subscribe(
      () => console.debug(`${this.hubName} connected`),
      (error) => console.error(`${this.hubName} error: ${error}`),
      () => console.debug(`${this.hubName} completed`)
    );
  }

  stop() {
    this.hub.disconnect();
  }

  onReceive(data: string) {
    console.log('data received', data);
  }
}
