import { tryParseJson } from "~/lib/fetch";
import { getAuth0Id, deleteToken } from "~/lib/auth0";

import { firstError } from "~/data";
import { ServerError } from '~/data/errors/server-error';
import Store from "@orbit/store";

export async function handleResponse(response, t) {
  const status = response.status;
  const unauthorized = status === 401;

  if (status === 403 || status === 401) {
    let errorJson = {};

    try {
      errorJson = await tryParseJson(response);
    } catch (e) {
      // body is not json
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


export const cacheQuery = () => {
  const auth0Id = getAuth0Id();

  return (q) => q.findRecords('user').filter({ attribute: 'auth0Id', value: auth0Id });
};


export function currentUserFromCache(dataStore: Store) {
  const usersFromCache = dataStore.cache.query(cacheQuery());

  return usersFromCache[0];
}