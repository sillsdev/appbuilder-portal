import { useEffect, useState, useRef, useCallback } from 'react';
import { pushPayload, useOrbit } from 'react-orbitjs';
import Store from '@orbit/store';

import { getAuth0Id, isLoggedIn, getToken } from '@lib/auth0';
import { get as authenticatedGet, defaultHeaders } from '@lib/fetch';
import { useTranslations } from '@lib/i18n';
import { attributesFor } from '@data/helpers';
import { CurrentUserFetchError } from '@data/errors/current-user-fetch-error';
import { cacheQuery, handleResponse, currentUserFromCache } from './helpers';

export function useFetcher() {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const effectRef = useRef<boolean>();
  const forceRequest = useRef<boolean>();

  const [abortController] = useState(() => new AbortController());
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState();
  const [needsFetch, setNeedsFetch] = useState(() => doesNeedFetch(dataStore));

  useEffect(() => {
    if (effectRef.current && !forceRequest.current) return;

    (async () => {
      console.log('getToken', getToken(), defaultHeaders());
      effectRef.current = true;
      setIsLoading(true);

      try {
        const fetchedUser = await getCurrentUser(dataStore, abortController.signal, t);

        setCurrentUser(fetchedUser);
      } catch (e) {
        setError(e);
      }

      setIsLoading(false);
      setNeedsFetch(false);
    
      effectRef.current = false;
      forceRequest.current = false;
    })();

    return () => {
      abortController.abort();
    };
  }, [forceRequest.current, needsFetch]);

  const fetchCurrentUser = useCallback(() => {
    forceRequest.current = true;

    return new Promise((resolve, reject) => {
      let interval;

      interval = setInterval(() => {
        if (!forceRequest.current && !isLoading) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
      
    });
  }, [currentUser])

  return { error, isLoading, currentUser, fetchCurrentUser };
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

async function getCurrentUser(dataStore: Store, signal, t) {
  const response = await authenticatedGet(currentUserUrl, { signal });
  const json = await handleResponse(response, t);

  await pushPayload(dataStore, json);

  const currentFromCache = currentUserFromCache(dataStore);

  if (!currentFromCache) {
    throw new CurrentUserFetchError('fetch was made, but user was not found in cache');
  }

  return currentFromCache;
}
