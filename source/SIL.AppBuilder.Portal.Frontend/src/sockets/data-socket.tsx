import { useEffect, useMemo } from 'react';
import { useOrbit } from 'react-orbitjs';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { DataClient } from './clients';

export default function SocketManager({ children }) {
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();

  const isLoggedIn = !!currentUser;
  const hubFactory = useMemo(() => new HubConnectionFactory(), [isLoggedIn]);
  const dataClient = useMemo(() => new DataClient(hubFactory, dataStore), [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    dataClient.start();

    return function disconnect() {
      dataClient.stop();
      hubFactory.disconnectAll();
    };
  });

  const pushOperations = (data: any) => {
    // TODO: build operations payload
    // TODO: data should be a number of things possible, like with
    //       withOrbit

    console.log('data pushing... ', data);
  };

  return children({
    pushOperations,
  });
}
