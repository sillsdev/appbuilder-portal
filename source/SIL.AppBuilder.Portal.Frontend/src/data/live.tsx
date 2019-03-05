import React, { useContext, useEffect, useState, useRef } from 'react';
import { useOrbit } from 'react-orbitjs';

import { DataSocket } from '~/sockets';

import Store from '@orbit/store';

import DataSocketClient, { DataHub } from '~/sockets/clients/data';

import { ConnectionStatus, HubConnection } from '@ssv/signalr-client';
import { TransformOrOperations } from '@orbit/data';
import { Observable, Subscription } from 'rxjs';

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
  // const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const {
    socket: { connection },
  } = dataCtx;

  const isConnected = connection.hubConnection.connectionState === ConnectionStatus.connected;
  console.log('connection...', connection.hubConnection.connectionState);
  // watchConnectionState(connection, setIsConnected);
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
  const subscription = useRef<Subscription>();

  useEffect(() => {
    if (!subscribeTo || !isConnected) {
      return;
    }

    if (!isSubscribed) {
      subscription.current = connection.send('SubscribeTo', subscribeTo).subscribe(
        () => {
          /* success */

          // console.log('subscribing to', subscribeTo, 'succeeded');
          setIsSubscribed(true);
        },
        () => {
          /* error */

          // console.log('subscribing to', subscribeTo, 'failed');
          setIsSubscribed(false);
        }
      );
    }

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }

      if (!isConnected) return;

      connection.send('UnsubscribeFrom', subscribeTo);
    };
  }, [subscribeTo, isConnected]);
}

function watchConnectionState(
  connection: HubConnection<DataHub>,
  setIsConnected: (b: boolean) => void
) {
  const subscription = useRef<Subscription>();

  useEffect(() => {
    if (!subscription.current) {
      subscription.current = connection.connectionState$.subscribe((state) => {
        setIsConnected(state.status === ConnectionStatus.connected);
      });
    }

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  });
}
