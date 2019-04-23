import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { useOrbit } from 'react-orbitjs';
import {
  HubConnectionFactory,
  HubConnection,
  ConnectionState,
  ConnectionStatus,
} from '@ssv/signalr-client';

import {
  transformsToJSONAPIOperations,
  JSONAPIOperationsPayload,
} from '~/data/orbitjs-operations-support';

import { isTesting } from '~/env';

import { TransformOrOperations } from '@orbit/data';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import JSONAPISource from '@orbit/jsonapi';
import Store from '@orbit/store';

import { DataClient } from './clients';

import { dataToLocalCache } from '~/data/orbitjs-operations-support/serialize-from-api';

import { useMemoIf } from '~/lib/hooks';

import DataSocketClient, { DataHub } from './clients/data';

import { useAuth } from '~/data/containers/with-auth';

const mockClient: DataClient = {
  hub: {
    connectionState$: {
      subscribe() {},
    },
    send() {},
    invoke() {},
    hubConnection: { state: undefined },
  },
  start() {},
  stop() {},
  dataStore: undefined,
  hubFactory: undefined,
  hubName: undefined,
  onData$$: undefined,
  onDataReceived: undefined,
  onReceive: undefined,
  subscription$$: {},
};

function LiveDataManager({ children }) {
  const { dataStore, sources } = useOrbit();
  const { isLoggedIn, auth0Id } = useAuth();

  const factoryCreator = useCallback(() => new HubConnectionFactory(), [isLoggedIn]);
  const hubFactory = useMemoIf(factoryCreator, !isTesting, [factoryCreator]);
  const clientCreator = useCallback(() => new DataClient(hubFactory, dataStore), [
    hubFactory,
    dataStore,
  ]);
  const dataClient = useMemoIf(clientCreator, !isTesting, [clientCreator]);

  const subscriptions = useMemo(() => [], [isLoggedIn]);

  useEffect(() => {
    if (isTesting || !isLoggedIn) {
      return;
    }

    dataClient.start();

    return function disconnect() {
      if (isTesting) return;

      console.log('disconnecting from client...');
      dataClient.stop();
      hubFactory.disconnectAll();
    };
  }, [isLoggedIn, auth0Id, dataClient]);

  const { isConnected, connectionState } = useConnectionStateWatcher(dataClient);

  const pushData = useCallback(
    (transforms: TransformOrOperations): Observable<JSONAPIOperationsPayload> => {
      const data = transformsToJSONAPIOperations(
        sources.remote as JSONAPISource,
        dataStore.transformBuilder,
        transforms
      );

      if (isTesting) return;

      let observer = dataClient.hub.invoke<string>('PerformOperations', JSON.stringify(data));

      observer.toPromise().then((json) => {
        return handleSocketPayload(dataStore, json);
      });
    },
    [isConnected, isTesting]
  );

  console.log('socket:', isConnected);
  return children({ socket: dataClient, pushData, subscriptions, isConnected, connectionState });
}

export default memo(LiveDataManager);

function handleSocketPayload(dataStore: Store, json: string) {
  const response: JSONAPIOperationsPayload = JSON.parse(json);

  dataToLocalCache(dataStore, response);

  return response;
}

function useConnectionStateWatcher(dataClient: DataSocketClient) {
  const connectionSubscription = useRef<Subscription>();
  const stateSubscription = useRef<Subscription>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>();

  useEffect(() => {
    if (isTesting) return;

    if (!connectionSubscription.current) {
      connectionSubscription.current = dataClient.connection$$.subscribe(() => {
        stateSubscription.current = dataClient.hub.connectionState$.subscribe((state) => {
          console.log('state change', state);
          setIsConnected(state.status === ConnectionStatus.connected);
          setConnectionState(state);
        });
      });
    }

    return () => {
      if (stateSubscription.current) {
        stateSubscription.current.unsubscribe();
      }
      if (connectionSubscription.current) {
        connectionSubscription.current.unsubscribe();
      }
    };
  }, [dataClient]);

  return { isConnected, connectionState };
}
