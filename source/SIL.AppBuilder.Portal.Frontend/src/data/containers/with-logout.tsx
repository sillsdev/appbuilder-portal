import * as React from 'react';
import { useRedux } from 'use-redux';
import { useOrbit } from 'react-orbitjs';
import { deleteToken } from '@lib/auth0';

import { APP_RESET } from '~/redux-store/reducers';

import { useAuth } from './with-auth';

import { useRouter } from '~/lib/hooks';

export interface IProvidedProps {
  logout: (e: any) => void;
}

export function LogoutProvider({ children }) {
  const [, dispatch] = useRedux();
  const { dataStore } = useOrbit();
  const { history } = useRouter();
  const { refreshAuth } = useAuth();

  const logout = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    dispatch({ type: APP_RESET });
    deleteToken();
    localStorage.clear();
    dataStore.cache.reset();
    refreshAuth();

    history.push('/login');
  };

  return children({ logout });
}

export function withLogout(WrappedComponent) {
  return (props) => (
    <LogoutProvider>
      {({ logout }) => <WrappedComponent {...{ ...props, logout }} />}
    </LogoutProvider>
  );
}
