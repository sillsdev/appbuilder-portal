import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useOrbit } from 'react-orbitjs';

import DataSocket from '~/sockets/data-socket';

import Store from '@orbit/store';

import DataSocketClient, { DataHub } from '~/sockets/clients/data';

import { ConnectionStatus, HubConnection } from '@ssv/signalr-client';
import { TransformOrOperations } from '@orbit/data';
import { Observable, Subscription } from 'rxjs';

import { isTesting } from '~/env';

interface ILiveDataContext {
  dataStore: Store;
  socket?: DataSocketClient;
  pushData: (transforms: TransformOrOperations) => Observable<{}>;
  subscriptions: string[];
  isConnected: boolean;
  connectionState: ConnectionStatus;
}

const DataContext = React.createContext<ILiveDataContext>({
  dataStore: undefined,
  socket: undefined,
  pushData: undefined,
  subscriptions: [],
  isConnected: false,
  connectionState: ConnectionStatus.disconnected,
});

export function useLiveData(subscribeTo?: string) {
  const dataCtx = useContext<ILiveDataContext>(DataContext);
  const {
    socket: { connection },
    isConnected,
  } = dataCtx;

  const { isSubscribed } = useSubscribeToResource(connection, subscribeTo, isConnected);

  const pushData = useCallback(
    (transforms: TransformOrOperations) => {
      if (isTesting) {
        console.debug('testing early return: figure out how to test websocket communication');
        return;
      }
      if (!isConnected) {
        throw new Error('Not connected to socket');
      }

      return dataCtx.pushData(transforms);
    },
    [isConnected, isTesting]
  );

  return {
    ...dataCtx,
    isSubscribed,
    isConnected,
    pushData,
  };
}

export function LiveDataProvider({ children }) {
  const { dataStore } = useOrbit();

  return (
    <DataSocket>
      {({ pushData, socket, subscriptions, isConnected, connectionState }) => {
        return (
          <DataContext.Provider
            value={{ dataStore, pushData, socket, subscriptions, isConnected, connectionState }}
          >
            {children}
          </DataContext.Provider>
        );
      }}
    </DataSocket>
  );
}

function useSubscribeToResource(connection: HubConnection<DataHub>, subscribeTo, isConnected) {
  const subscription = useRef<Subscription>();
  const [isSubscribed, setIsSubscribed] = useState();

  useEffect(() => {
    if (isTesting || !subscribeTo || !isConnected) {
      return;
    }

    if (!isSubscribed && !subscription.current) {
      subscription.current = connection.send('SubscribeTo', subscribeTo).subscribe(
        () => {
          setIsSubscribed(true);
        },
        () => {
          setIsSubscribed(false);
        }
      );
    }

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }

      if (!isConnected) return;
      if (connection.hubConnection.state !== ConnectionStatus.connected) return;

      connection.send('UnsubscribeFrom', subscribeTo);
    };
  }, [subscribeTo, isConnected]);

  return { isSubscribed };
}
