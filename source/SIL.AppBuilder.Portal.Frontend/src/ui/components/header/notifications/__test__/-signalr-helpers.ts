// tslint:disable:max-classes-per-file
import * as SignalRClient from '@ssv/signalr-client';
import { Subject, Observable } from 'rxjs';

export class MockHubFactory extends SignalRClient.HubConnectionFactory {
  create(...connectionOptions: SignalRClient.HubConnectionOptions[]){
    super.create(...connectionOptions);
    return this;
  }

  get<THub>(key: string): SignalRClient.HubConnection<THub>{
    return wrapConnection<THub>(super.get(key));
  }
}

interface ConnectionWrapper<THub> {
  push<TResult>(methodName: keyof THub, value: TResult): void;
  isWrapped: boolean;
  subjects: {[key: string]: Subject<any>};
  originalOn<TResult>(methodName: keyof THub): Observable<TResult>;
}

export type WrappedConnection<THub> = SignalRClient.HubConnection<THub> & ConnectionWrapper<THub>;

function wrapConnection<THub>(connection: SignalRClient.HubConnection<THub>): SignalRClient.HubConnection<THub>{
  const wrappedConnection = connection as WrappedConnection<THub>;

  if (wrappedConnection.isWrapped){ return connection; }

  wrappedConnection.isWrapped = true;
  wrappedConnection.subjects = {};
  wrappedConnection.push = function<TResult>(methodName: keyof THub, value: TResult) {
    this.subjects[methodName].next(value);
  };

  wrappedConnection.originalOn = wrappedConnection.on;

  wrappedConnection.on = function<TResult>(methodName: keyof THub) : Observable<TResult> {
    const subject = new Subject<TResult>();
    const observable$ = (this as WrappedConnection<THub>).originalOn<TResult>(methodName);
    observable$.subscribe(subject);
    this.subjects[methodName] = subject;
    return subject;
  };

  return connection;
}
