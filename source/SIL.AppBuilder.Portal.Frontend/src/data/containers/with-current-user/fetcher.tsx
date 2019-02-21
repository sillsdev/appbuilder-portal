import { useEffect, useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { pushPayload, useOrbit } from 'react-orbitjs';
import useAbortableFetch from 'use-abortable-fetch';
import Store from '@orbit/store';

import { firstError } from '@data';

import { deleteToken, getAuth0Id, isLoggedIn, getToken } from '@lib/auth0';
import { get as authenticatedGet, tryParseJson, defaultHeaders } from '@lib/fetch';
import { useTranslations } from '@lib/i18n';
import { attributesFor } from '@data/helpers';
import { ServerError } from '@data/errors/server-error';
import { CurrentUserFetchError } from '@data/errors/current-user-fetch-error';
import { useFetch } from 'react-hooks-fetch';
import { getCurrentOrganizationId } from '~/lib/current-organization';

export function useFetcher() {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  // const request = useRef<boolean>();
  // const []
  // const [state, setState] = useState(() => ({
  //   currentUser: currentUserFromCache(dataStore),
  //   error: undefined,
  //   isLoading: true,
  // }));
  // const { currentUser, error, isLoading } = state;

  const needsFetch = doesNeedFetch(dataStore);

  const opts = useMemo(() => ({
    headers: {
      ...defaultHeaders(),
    }
  }), [getToken(), needsFetch, isLoggedIn()]);
  console.log(opts);
  const { error, data } = useFetch(currentUserUrl, opts);

  return { error, currentUser: data, fetchCurrentUser: () => {} };
  // useLayoutEffect(() => {
  //   request.current = !needsFetch;
  // });

  // async function fetchCurrentUser() {
  //   if (request.current) {
  //     return;
  //   }

  //   request.current = true;
  //   setState((prevState) => ({ ...prevState, isLoading: true }));

  //   try {
  //     const userFromCache = await getCurrentUser(dataStore, t);

  //     setState(() => ({ isLoading: false, error: undefined, currentUser: userFromCache }));
  //   } catch (error) {
  //     setState((prevState) => ({ ...prevState, isLoading: false, error }));
  //   }

  //   request.current = false;
  // }

  // useEffect(() => {
  //   fetchCurrentUser();
  // }, [request, needsFetch]);

  return {
    currentUser,
    isLoading,
    error,
    fetchCurrentUser,
  };
}

const cacheQuery = () => {
  const auth0Id = getAuth0Id();

  return (q) => q.findRecords('user').filter({ attribute: 'auth0Id', value: auth0Id });
};

async function handleResponse(response, t) {
  const status = response.status;
  const unauthorized = status === 401;

  if (status === 403 || status === 401) {
    let errorJson = {};

    try {
      errorJson = await tryParseJson(response);
    } catch (e) {
      // body is not json
      console.log('auth0 id: ', getAuth0Id(), response);
      console.error('response body is not json', e);
    }

    const errorTitle = firstError(errorJson).title;
    const defaultMessage = unauthorized ? t('errors.notAuthorized') : t('errors.userForbidden');

    deleteToken();
    throw new Error(errorTitle || defaultMessage);
  }

  if (status >= 500) {
    const text = await response.text();
    throw new ServerError(status, text);
  }

  const json = await tryParseJson(response);

  return json;
}

function currentUserFromCache(dataStore: Store) {
  const usersFromCache = dataStore.cache.query(cacheQuery());

  return usersFromCache[0];
}

function doesNeedFetch(dataStore: Store) {
  if (!isLoggedIn()) { return false; }
  
  const fromCache = currentUserFromCache(dataStore);
  const auth0IdFromJWT = getAuth0Id();

  const isAuthMissing = !auth0IdFromJWT;
  const existingId = attributesFor(fromCache).auth0Id;
  const differsFromJWT = existingId !== auth0IdFromJWT;

  return isAuthMissing || !fromCache || differsFromJWT;
}

const currentUserUrl = [
  '/api/users/current-user',
  '?include=organization-memberships.organization,',
  'group-memberships.group,',
  'user-roles.role',
].join('');

async function getCurrentUser(dataStore: Store, t) {
  const response = await authenticatedGet(currentUserUrl);
  const json = await handleResponse(response, t);

  await pushPayload(dataStore, json);

  const currentFromCache = currentUserFromCache(dataStore);

  if (!currentFromCache) {
    throw new CurrentUserFetchError('fetch was made, but user was not found in cache');
  }

  return currentFromCache;
}
