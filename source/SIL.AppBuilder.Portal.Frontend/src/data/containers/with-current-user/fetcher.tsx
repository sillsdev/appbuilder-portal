import * as React from 'react';
import { withData, ILegacyProvidedProps, pushPayload } from 'react-orbitjs';
import { compose } from 'recompose';

import { TYPE_NAME } from '@data/models/user';
import { getAuth0Id } from '@lib/auth0';
import { get as authenticatedGet, tryParseJson } from '@lib/fetch';

import { firstError } from '@data';

import { deleteToken } from '@lib/auth0';
import { withTranslations, i18nProps } from '@lib/i18n';
import { attributesFor } from '@data/helpers';
import { ServerError } from '@data/errors/server-error';
import { CurrentUserFetchError } from '@data/errors/current-user-fetch-error';

import { IProps, IState, IFetchCurrentUserOptions } from './types';

const cacheQuery = () => {
  const auth0Id = getAuth0Id();

  return (q) => q.findRecords(TYPE_NAME).filter({ attribute: 'auth0Id', value: auth0Id });
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

// TODO: store the attempted URL so that after login,
//     we can navigate back.
export function withFetcher() {
  return (InnerComponent) => {
    class WrapperClass extends React.Component<IProps & ILegacyProvidedProps & i18nProps, IState> {
      makingRequest: boolean;
      forceComponentUpdate: boolean = false;

      constructor(props) {
        super(props);

        this.state = {
          currentUser: undefined,
          isLoading: true,
          error: undefined,
          networkFetchComplete: false,
          fetchCurrentUser: this.fetchCurrentUser,
        };
      }

      componentDidMount() {
        this.fetchCurrentUser();
      }

      componentDidUpdate() {
        this.fetchCurrentUser();
      }

      shouldComponentUpdate(nProps, nState) {
        if (this.forceComponentUpdate) {
          this.forceComponentUpdate = false;

          return true;
        }
        const { currentUser } = this.state;
        // if we have a currentUser from cache, and the currentUser
        // matches the auth0Id we have from the JWT, then don't
        // make a network request.
        //
        // NOTE: this whole lifecycle hook is kind of a hack for lack
        //       of a better 'get the current user' pattern.
        const existingId = attributesFor(currentUser).auth0Id;
        const nextExistingId = attributesFor(nState.currentUser).auth0Id;

        const idsHaveChanged = existingId !== nextExistingId;
        const tokenChanged = this.didTokenChange;

        return idsHaveChanged || tokenChanged || nState.networkFetchComplete === false;
      }

      get didTokenChange() {
        const { currentUser } = this.state;
        const auth0IdFromJWT = getAuth0Id();

        const existingId = attributesFor(currentUser).auth0Id;

        return auth0IdFromJWT !== existingId;
      }

      fetchCurrentUser = async (
        options: IFetchCurrentUserOptions = {
          forceReloadFromCache: false,
          forceReloadFromServer: false,
        }
      ) => {
        let { forceReloadFromServer, forceReloadFromCache } = options;
        forceReloadFromCache = forceReloadFromCache || false;
        forceReloadFromServer = forceReloadFromServer || false;

        if (forceReloadFromCache || forceReloadFromServer) {
          this.forceComponentUpdate = true;
        }

        const { t, dataStore } = this.props;
        const { currentUser } = this.state;

        if (this.makingRequest) {
          return;
        }
        let needsUpdate = true;
        if (currentUser && !this.didTokenChange) {
          needsUpdate = false;
        }
        if (!getAuth0Id()) {
          return;
        }

        try {
          if (needsUpdate || forceReloadFromServer) {
            this.makingRequest = true;

            const response = await authenticatedGet(
              [
                '/api/users/current-user',
                '?include=organization-memberships.organization,group-memberships.group,user-roles.role',
              ].join('')
            );

            const json = await handleResponse(response, t);

            await pushPayload(dataStore, json);
          }

          if (needsUpdate || forceReloadFromServer || forceReloadFromCache) {
            const usersFromCache = await dataStore.cache.query(cacheQuery());
            const currentFromCache = usersFromCache[0];

            if (!currentFromCache) {
              throw new CurrentUserFetchError('fetch was made, but user was not found in cache');
            }

            this.setState(
              { currentUser: currentFromCache, isLoading: false, networkFetchComplete: true },
              () => {
                this.makingRequest = false;
              }
            );
          }
        } catch (e) {
          this.setState({ error: e, networkFetchComplete: true, isLoading: false }, () => {
            this.makingRequest = false;
          });
        }
      };

      render() {
        const { currentUser } = this.state;

        return (
          <InnerComponent {...this.props} currentUserProps={this.state} currentUser={currentUser} />
        );
      }
    }

    return compose(
      withTranslations,
      withData({}),
    )(WrapperClass);
  };
}
