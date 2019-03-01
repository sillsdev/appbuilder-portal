import React, { useContext, useEffect, useState } from 'react';
import { useOrbit } from 'react-orbitjs';

import { DataSocket } from '~/sockets';

import Store from '@orbit/store';

import DataSocketClient, { DataHub } from '~/sockets/clients/data';

import { ConnectionState, ConnectionStatus, HubConnection } from '@ssv/signalr-client';
import { TransformOrOperations } from '@orbit/data';
import { Observable } from 'rxjs';

interface ILiveDataContext {
  dataStore: Store;
  socket?: DataSocketClient;
  pushData: (transforms: TransformOrOperations) => Observable<{}>;
  subscriptions: string[];
}

const DataContext = React.createContext<ILiveDataContext>({
  dataStore: undefined,
  socket: undefined,
  pushData: undefined,
  subscriptions: [],
});

export function useLiveData(subscribeTo?: string) {
  const dataCtx = useContext(DataContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const {
    socket: { connection },
  } = dataCtx;

  watchConnectionState(connection, setIsConnected);
  subscribeToResource(connection, subscribeTo, isConnected, isSubscribed, setIsSubscribed);

  return {
    ...dataCtx,
    isSubscribed,
    isConnected,
    pushData: (transforms) => {
      if (!isConnected) {
        throw new Error('Not connected to socket');
      }

      if (subscribeTo && !isSubscribed) {
        throw new Error('Not subscribed to resource');
      }

      return dataCtx.pushData(transforms);
    },
  };
}

export function LiveDataProvider({ children }) {
  const { dataStore } = useOrbit();

  return (
    <DataSocket>
      {({ pushData, socket, subscriptions }) => {
        return (
          <DataContext.Provider value={{ dataStore, pushData, socket, subscriptions }}>
            {children}
          </DataContext.Provider>
        );
      }}
    </DataSocket>
  );
}

function subscribeToResource(
  connection: HubConnection<DataHub>,
  subscribeTo,
  isConnected,
  isSubscribed,
  setIsSubscribed
) {
  useEffect(() => {
    if (!subscribeTo || !isConnected) {
      return;
    }

    let resourceSubscription$;

    if (!isSubscribed) {
      resourceSubscription$ = connection
        .invoke('SubscribeTo', subscribeTo)
        .subscribe(
          () => /* success */ setIsSubscribed(true),
          () => /* error */ setIsSubscribed(false)
        );
    }

    return () => {
      if (resourceSubscription$) {
        resourceSubscription$.unsubscribe();
      }

      if (!isConnected) return;

      connection.send('UnsubscribeFrom', subscribeTo);
    };
  }, [connection, subscribeTo, isConnected]);
}

function watchConnectionState(
  connection: HubConnection<DataHub>,
  setIsConnected: (b: boolean) => void
) {
  useEffect(() => {
    const stateSubscription$ = connection.connectionState$.subscribe((state) => {
      setIsConnected(state.status === ConnectionStatus.connected);
    });

    return () => {
      stateSubscription$.unsubscribe();
    };
  }, [connection]);
}
