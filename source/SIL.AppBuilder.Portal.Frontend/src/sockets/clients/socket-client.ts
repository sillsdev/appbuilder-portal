import { ISubscription } from 'rxjs/Subscription';
import { HubConnectionFactory, HubConnection } from '@ssv/signalr-client';
import { LogLevel, HttpTransportType } from '@aspnet/signalr';
import Store from '@orbit/store';
import { getToken } from '@lib/auth0';

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
  connection: HubConnection<THub>;
  dataStore: Store;
  subscription$$: ISubscription;

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
    this.connection = hubFactory.get(this.hubName);
  }

  start() {
    this.subscription$$ = this.connection
      .connect()
      .subscribe(
        () => console.log(`${this.hubName} connected`),
        (error) => console.log(`${this.hubName} error: ${error}`),
        () => console.log(`${this.hubName} completed`)
      );
  }

  stop() {
    this.subscription$$.unsubscribe();
    this.connection.disconnect();
  }

  onReceive(data: string) {
    console.log('data received', data);
  }
}
