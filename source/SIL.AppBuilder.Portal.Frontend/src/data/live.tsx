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
  const { socket, isConnected } = dataCtx;

  const hub: HubConnection<DataHub> = isTesting ? undefined : socket.hub;

  const { isSubscribed } = useSubscribeToResource(hub, subscribeTo, isConnected);

  const pushData = useCallback(
    (transforms: TransformOrOperations) => {
      if (isTesting) {
        console.debug('testing early return: figure out how to test websocket communication');
        return;
      }

      return dataCtx.pushData(transforms);
    },
    [dataCtx]
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

function useSubscribeToResource(
  hub: HubConnection<DataHub>,
  subscribeTo: string,
  isConnected: boolean
) {
  const subscription = useRef<Subscription>();
  const [isSubscribed, setIsSubscribed] = useState();

  useEffect(() => {
    if (isTesting || !subscribeTo || !isConnected) {
      return;
    }

    if (!isSubscribed && !subscription.current) {
      subscription.current = hub.send('SubscribeTo', subscribeTo).subscribe(
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
      // NOTE: isConnected from the context provider doesn't
      // propagate its update quick enough for this particular value
      // of this particular copy of the reference to be correct /
      // the most up to date. So we need to access the state
      // directly on the hub, which is managed with normal classes
      // instead of waiting for react-render lifecycles
      if (hub['hubConnection'].state !== ConnectionStatus.connected) {
        /* private field. YOLO */
        return;
      }

      try {
        hub.send('UnsubscribeFrom', subscribeTo);
      } catch (e) {
        console.log(
          'tried to unsubscribe: ',
          subscribeTo,
          isConnected,
          hub['hubConnection'].state,
          ConnectionStatus.connected
        );

        throw e;
      }
    };
  }, [subscribeTo, isConnected, isSubscribed, hub]);

  return { isSubscribed };
}
