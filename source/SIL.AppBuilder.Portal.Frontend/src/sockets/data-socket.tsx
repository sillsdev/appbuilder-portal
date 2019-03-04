import { useEffect, useMemo } from 'react';
import { useOrbit, pushPayload } from 'react-orbitjs';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { useCurrentUser } from '~/data/containers/with-current-user';
import { transformsToJSONAPIOperations } from '~/data/orbitjs-operations-support';

import { isTesting } from '~/env';

import {
  TransformOrOperations,
} from '@orbit/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import JSONAPISource, { JSONAPIDocument } from '@orbit/jsonapi';
import Store from '@orbit/store';

import { DataClient } from './clients';

export interface OperationsResponse {
  operations: JSONAPIDocument[];
}

export default function LiveDataManager({ children }) {
  const { dataStore, sources } = useOrbit();
  const { currentUser } = useCurrentUser();

  const isLoggedIn = !!currentUser;
  const hubFactory = useMemo(() => new HubConnectionFactory(), [isLoggedIn]);
  const dataClient = useMemo(() => new DataClient(hubFactory, dataStore), [isLoggedIn]);
  const subscriptions = useMemo(() => [], [isLoggedIn]);

  useEffect(() => {
    if (!isTesting && !isLoggedIn) {
      return;
    }

    dataClient.start();

    return function disconnect() {
      dataClient.stop();
      hubFactory.disconnectAll();
    };
  }, [isLoggedIn]);

  const pushData = (transforms: TransformOrOperations): Observable<OperationsResponse> => {
    const data = transformsToJSONAPIOperations(
      sources.remote as JSONAPISource,
      dataStore.transformBuilder,
      transforms
    );

    return dataClient.connection
      .invoke<string>('PerformOperations', JSON.stringify(data))
      .pipe(map<string, OperationsResponse>((json) => handleSocketPayload(dataStore, json)));
  };

  return children({ socket: dataClient, pushData, subscriptions });
}

function handleSocketPayload(dataStore: Store, json: string) {
  const response: OperationsResponse = JSON.parse(json);
  const data = response.operations.map((operation: JSONAPIDocument) => operation.data);

  pushPayload(dataStore, { data });

  return response;
}

