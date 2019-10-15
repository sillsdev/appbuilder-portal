import { useCallback, useMemo, useState, useEffect } from 'react';
import { pushPayload, useOrbit } from 'react-orbitjs';
import { TYPE_NAME } from '@data/models/user';
import { getAuth0Id } from '@lib/auth0';
import { tryParseJson } from '@lib/fetch';

import { firstError } from '@data';

import { deleteToken } from '@lib/auth0';
import { ServerError } from '@data/errors/server-error';
import { useFetch } from 'react-hooks-fetch';

import { useAuth } from '../with-auth';

const cacheQuery = () => {
  const auth0Id = getAuth0Id();

  return (q) => q.findRecords(TYPE_NAME).filter({ attribute: 'auth0Id', value: auth0Id });
};

export async function handleResponse(response, t) {
  const status = response.status;
  const unauthorized = status === 401;

  if (status === 403 || status === 401) {
    let errorJson = {};

    try {
      errorJson = await tryParseJson(response);
    } catch (e) {
      // body is not json
      console.log(getAuth0Id());
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

export function CurrentUserFetcher({ children }) {
  const {
    dataStore,
    subscriptions: { users },
  } = useOrbit({
    users: cacheQuery(),
  });
  const { jwt, isLoggedIn } = useAuth();
  const [refetchCount, setCount] = useState();
  const refetch = useCallback(() => setCount(refetchCount + 1), [refetchCount]);
  const options = useMemo(() => {
    return {
      method: 'GET',
      headers: {
        ['Authorization']: `Bearer ${jwt}`,
        ['X-Refetch-Count']: refetchCount,
      },
    };
  }, [jwt, refetchCount]);

  const { error, data } = useFetch(
    [
      '/api/users/current-user',
      '?include=organization-memberships.organization,group-memberships.group,user-roles.role',
    ].join(''),
    options
  );

  useEffect(() => {
    if (!data) return;

    pushPayload(dataStore, data);
  }, [data, dataStore]);

  if (error) {
    // errors are not handled here.
    // also, this is the only way we can have 'unauthenticated routes'
    return children({ currentUser: undefined, refetch, error });
  }

  const currentUser = users && users[0];
  if (!data || !currentUser) return null;

  return children({ currentUser, refetch, error: undefined });
}
