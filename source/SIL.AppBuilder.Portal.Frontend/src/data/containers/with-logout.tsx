import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useOrbit } from 'react-orbitjs';
import { deleteToken } from '@lib/auth0';

import { useAuth } from './with-auth';

import { APP_RESET } from '~/redux-store/reducers';
import { useRouter } from '~/lib/hooks';

export interface IProvidedProps {
  logout: (e: any) => void;
}

export function LogoutProvider({ children }) {
  const dispatch = useDispatch();
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
