// support code for custom login form and
// managing the auth token locally
//
// TODO: consider localForage instead of localstorage.
//       localForage will use better storage mechanisms
//       if available
import Auth0Lock from 'auth0-lock';
import * as Auth0 from 'auth0-js';
import * as jwtDecode from 'jwt-decode';

import { auth0 as auth0Env } from '@env';

const storageKey = 'userToken';


export function getToken(): string {
  return localStorage.getItem(storageKey);
}

export function getPictureUrl(): string {
  const jwt = getDecodedJWT();

  return jwt.picture;
}

export function setToken(token: string) {
  localStorage.setItem(storageKey, token);
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


// example playoad fields from successful authentication
//
// accessToken: string
// appState:null
// expiresIn:seconds
// idToken:string
// idTokenPayload:{ general user info }
// refreshToken:null
// scope:"openid profile email"
// state: string
// tokenType : "Bearer"
let lockInstance: Auth0LockStatic;
export function getAuth0LockInstance(options = {}): Auth0LockStatic {
  if (lockInstance === undefined) {
    lockInstance = new Auth0Lock(auth0Env.clientId, auth0Env.domain, {
      // TODO: pull language form i18next
      language: 'en',
      additionalSignUpFields: [{
        name: 'given_name',
        placeholder: 'Given Name'
      }, {
        name: 'family_name',
        placeholder: 'Family Name'
      }],
      auth: {
        responseType: 'token id_token',
        sso: false,
      },
      autoclose: false,
      autofocus: true,
      closable: false,
      allowShowPassword: false,
      // socialButtonStyle: 'small',
      languageDictionary: {
        title: 'Welcome to Scriptoria',
      },
      theme: {
        logo: 'https://software.sil.org/wp/wp-content/uploads/2017/01/2014_sil_logo_80w_96h.png',
      },
      ...options
    });
  }

  return lockInstance;
}

export function showLock(): Auth0LockStatic {
  const lock = getAuth0LockInstance();

  lock.show();

  return lock;
}

export function hideLock(): Auth0LockStatic {
  const lock = getAuth0LockInstance();

  lock.hide();
  lockInstance = undefined;

  return lock;
}

export function login(username: string, password: string): Promise<string> {
  const loginPayload = {
    realm: auth0Env.connection,
    username,
    password,
    scope: auth0Env.scope
  };

  const auth0 = new Auth0.WebAuth({
    domain: auth0Env.domain,
    clientID: auth0Env.clientId,
    responseType: 'token id_token',
    scope: auth0Env.scope
  });

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
