import { useEffect, useMemo } from 'react';
import { useOrbit } from 'react-orbitjs';
import { HubConnectionFactory, HubConnection } from '@ssv/signalr-client';

import {
  transformsToJSONAPIOperations,
  JSONAPIOperationsPayload,
} from '~/data/orbitjs-operations-support';

import { isTesting } from '~/env';

import { TransformOrOperations } from '@orbit/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import JSONAPISource from '@orbit/jsonapi';
import Store from '@orbit/store';

import { DataClient } from './clients';

import { dataToLocalCache } from '~/data/orbitjs-operations-support/serialize-from-api';

import { useMemoIf } from '~/lib/hooks';

import { DataHub } from './clients/data';

import { useAuth } from '~/data/containers/with-auth';

const mockClient: DataClient = {
  connection: {
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

export default function LiveDataManager({ children }) {
  const { dataStore, sources } = useOrbit();
  const { isLoggedIn, auth0Id } = useAuth();

  const hubFactory = useMemoIf(() => new HubConnectionFactory(), !isTesting, [isLoggedIn]);
  const dataClient =
    useMemoIf(() => new DataClient(hubFactory, dataStore), !isTesting, [isLoggedIn]) || mockClient;
  const subscriptions = useMemo(() => [], [isLoggedIn]);

  useEffect(() => {
    if (isTesting || !isLoggedIn) {
      return;
    }

    dataClient.start();

    return function disconnect() {
      if (isTesting) return;

      dataClient.stop();
      hubFactory.disconnectAll();
    };
  }, [isLoggedIn, auth0Id]);

  const pushData = (transforms: TransformOrOperations): Observable<JSONAPIOperationsPayload> => {
    const data = transformsToJSONAPIOperations(
      sources.remote as JSONAPISource,
      dataStore.transformBuilder,
      transforms
    );

    if (!isTesting) return;

    return dataClient.connection
      .invoke<string>('PerformOperations', JSON.stringify(data))
      .pipe(map<string, JSONAPIOperationsPayload>((json) => handleSocketPayload(dataStore, json)));
  };

  return children({ socket: dataClient, pushData, subscriptions });
}

function handleSocketPayload(dataStore: Store, json: string) {
  const response: JSONAPIOperationsPayload = JSON.parse(json);

  dataToLocalCache(dataStore, response);

  return response;
}
