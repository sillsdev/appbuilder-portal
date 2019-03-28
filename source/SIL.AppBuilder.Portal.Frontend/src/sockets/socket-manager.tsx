import { useEffect } from 'react';
import { useOrbit } from 'react-orbitjs';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { useMemoIf } from '~/lib/hooks';

import { isTesting } from '@env';

import { NotificationsClient } from './clients';

import { useAuth } from '~/data/containers/with-auth';

import { getToken } from '~/lib/auth0';

export default function SocketManager({ children }) {
  const { dataStore } = useOrbit();
  const { isLoggedIn, auth0Id } = useAuth();

  const hubFactory = useMemoIf(() => new HubConnectionFactory(), !isTesting, [isLoggedIn, auth0Id]);
  const notificationsClient = useMemoIf(
    () => {
      return new NotificationsClient(hubFactory, dataStore);
    },
    !isTesting,
    [isLoggedIn, auth0Id]
  );

  useEffect(() => {
    if (isTesting || !isLoggedIn) {
      return;
    }

    notificationsClient.start();

    return function disconnect() {
      if (isTesting) return;

      notificationsClient.stop();
      hubFactory.disconnectAll();
    };
  }, [isLoggedIn, auth0Id, notificationsClient, hubFactory]);

  return children;
}
