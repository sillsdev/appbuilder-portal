import { HubConnectionFactory } from '@ssv/signalr-client';
import Store from '@orbit/store';

export default interface SocketClient {
  init(hubFactory: HubConnectionFactory, dataStore: Store): void;
  start(): void;
  stop(): void;
}
