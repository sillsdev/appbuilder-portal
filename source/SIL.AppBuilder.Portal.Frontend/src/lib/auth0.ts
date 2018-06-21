// support code for custom login form and
// managing the auth token locally
//
// TODO: consider localForage instead of localstorage.
//       localForage will use better storage mechanisms
//       if available
import * as Auth0 from 'auth0-js';
import * as jwtDecode from 'jwt-decode';

import { auth0 as auth0Env } from '@env';

const storageKey = 'userToken';

const auth0 = new Auth0.WebAuth({
  domain: auth0Env.domain,
  clientID: auth0Env.clientId,
  responseType: 'token id_token',
  scope: auth0Env.scope
});

export function getToken(): string {
  return localStorage.getItem(storageKey);
}

export function deleteToken() {
  localStorage.setItem(storageKey, undefined);
}

export function isTokenExpired(jwt = getDecodedJWT()) {
  if (!jwt) {
    return true;
  }

  const now = new Date().getTime() / 1000;
  const isExpired = now > jwt.exp;

  return isExpired;
}

export function getDecodedJWT(): Auth0JWT | undefined {
  const token = getToken();

  try {
    return jwtDecode<Auth0JWT>(token);
  }
  catch (e) {
    // the token is invalid
    return undefined;
  }
}

export function getAuth0Id(): string {
  const jwt = getDecodedJWT();

  return jwt && jwt.sub;
}

export function isLoggedIn(): boolean {
  const jwt = getDecodedJWT();

  return jwt && !isTokenExpired(jwt) || false;
}

export function isLoggedOut(): boolean {
  return !isLoggedIn();
}

export function login(username: string, password: string): Promise<string> {
  const loginPayload = {
    realm: auth0Env.connection,
    username,
    password,
    scope: auth0Env.scope
  };

  return new Promise((resolve, reject) => {
    auth0.client.login(loginPayload, (err, data) => {
      const e = err || data.error;
      if (e) {
        return reject(e);
      }

      localStorage.setItem(storageKey, data.idToken);

      resolve(data.idToken);
    });
  });
}
