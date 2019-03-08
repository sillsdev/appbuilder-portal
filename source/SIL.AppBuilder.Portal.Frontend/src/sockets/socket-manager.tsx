import { useEffect, useMemo } from 'react';
import { useOrbit } from 'react-orbitjs';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { isTesting } from '@env';

import { NotificationsClient } from './clients';

function useMemoIf(fn, condition, memoOn) {
  return useMemo(() => {
    if (condition) {
      return fn();
    }
  }, memoOn);
}

export default function SocketManager({ children }) {
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();

  const isLoggedIn = !!currentUser;
  const hubFactory = useMemoIf(() => new HubConnectionFactory(), !isTesting, [isLoggedIn]);
  const notificationsClient = useMemoIf(
    () => new NotificationsClient(hubFactory, dataStore),
    !isTesting,
    [isLoggedIn]
  );

  useEffect(() => {
    if (isTesting || !isLoggedIn) {
      return;
    }

    notificationsClient.start();

    return function disconnect() {
      notificationsClient.stop();
      hubFactory.disconnectAll();
    };
  });

  return children;
}
