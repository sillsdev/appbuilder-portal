import React, { useContext, useEffect, useState, useRef } from 'react';
import { useOrbit } from 'react-orbitjs';

import { DataSocket } from '~/sockets';

import Store from '@orbit/store';

import DataSocketClient, { DataHub } from '~/sockets/clients/data';

import { ConnectionStatus, HubConnection, ConnectionState } from '@ssv/signalr-client';
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
  const {
    socket: { connection },
  } = dataCtx;

  const { isConnected } = useConnectionStateWatcher(connection);
  const { isSubscribed } = useSubscribeToResource(connection, subscribeTo, isConnected);

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

function useSubscribeToResource(connection: HubConnection<DataHub>, subscribeTo, isConnected) {
  const subscription = useRef<Subscription>();
  const [isSubscribed, setIsSubscribed] = useState();

  useEffect(() => {
    if (!subscribeTo || !isConnected) {
      return;
    }

    if (!isSubscribed && !subscription.current) {
      subscription.current = connection.send('SubscribeTo', subscribeTo).subscribe(
        () => {
          // console.log('subscribing to', subscribeTo, 'succeeded');
          setIsSubscribed(true);
        },
        () => {
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
      if (connection.hubConnection.state !== ConnectionStatus.connected) return;

      connection.send('UnsubscribeFrom', subscribeTo);
    };
  }, [subscribeTo, isConnected]);

  return { isSubscribed };
}

function useConnectionStateWatcher(connection: HubConnection<DataHub>) {
  const subscription = useRef<Subscription>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>();

  useEffect(() => {
    if (!subscription.current) {
      subscription.current = connection.connectionState$.subscribe((state) => {
        setIsConnected(state.status === ConnectionStatus.connected);
        setConnectionState(state);
      });
    }

    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
    };
  });

  return { isConnected, connectionState };
}
