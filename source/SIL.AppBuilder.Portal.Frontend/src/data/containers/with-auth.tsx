import React, { createContext, useContext, useState } from 'react';

import { isLoggedIn, hasVerifiedEmail, getAuth0Id, isTokenExpired, getToken } from '~/lib/auth0';

interface IAuthContextInfo {
  isLoggedIn: boolean;
  hasVerifiedEmail: boolean;
  isTokenExpired: boolean;
  auth0Id: string;
  jwt: string;
}

type IAuthContext = IAuthContextInfo & {
  refreshAuth(): void;
};

export const AuthContext = createContext<IAuthContext>({
  jwt: '',
  isLoggedIn: false,
  hasVerifiedEmail: false,
  isTokenExpired: true,
  auth0Id: undefined,
  refreshAuth: undefined,
});

export function AuthProvider({ children }) {
  const [info, setInfo] = useState({
    jwt: getToken(),
    isLoggedIn: isLoggedIn(),
    hasVerifiedEmail: hasVerifiedEmail(),
    auth0Id: getAuth0Id(),
    isTokenExpired: isTokenExpired(),
  });

  return (
    <AuthContext.Provider
      value={{
        ...info,
        refreshAuth: () =>
          setInfo({
            jwt: getToken(),
            isLoggedIn: isLoggedIn(),
            hasVerifiedEmail: hasVerifiedEmail(),
            auth0Id: getAuth0Id(),
            isTokenExpired: isTokenExpired(),
          }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthConsumer({ children }) {
  const value = useAuth();

  return children(value);
}

export function useAuth() {
  return useContext(AuthContext);
}
