import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { SingleResourceDoc, ResourceObject } from 'jsonapi-typescript';

import { pushPayload, USERS_TYPE } from '@data';
import { UserAttributes, TYPE_NAME } from '@data/models/user';

import { getAuth0Id } from '@lib/auth0';
import { get as authenticatedGet, tryParseJson } from '@lib/fetch';
import { hasRelationship, firstError } from '@data';

import PageLoader from '@ui/components/loaders/page';
import OrgMembershipRequired from '@ui/components/errors/org-membership-required';
import PageError from '@ui/components/errors/page';

import { deleteToken } from '@lib/auth0';
import { withTranslations, i18nProps } from '@lib/i18n';

import * as toast from '@lib/toast';
import { attributesFor } from '@data/helpers';

type UserPayload = SingleResourceDoc<USERS_TYPE, UserAttributes>;

const mapRecordsToProps = () => {
  const auth0Id = getAuth0Id();

  return {
    usersMatchingLoggedInUser: q => q.findRecords(TYPE_NAME)
      .filter({ attribute: 'auth0Id', value: auth0Id })
  };
};

export interface IProvidedProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}

interface IProps {
  usersMatchingLoggedInUser: UserPayload;
}

interface IState {
  currentUser: UserPayload;
  isLoading: boolean;
  error?: any;
  networkFetchComplete: boolean;
}

const defaultOptions = {
  redirectOnFailure: true
};


class ServerError extends Error {
  status: number;
  text: string;

  constructor(status, text) {
    super(text);

    this.status = status;
    this.text = text;
  }
}

// TODO: store the attempted URL so that after login,
//     we can navigate back.
export function withCurrentUser(opts = {}) {
  const options = {
    ...defaultOptions,
    ...opts
  };

  return InnerComponent => {
    class WrapperClass extends React.Component<IProps & WithDataProps & i18nProps, IState> {
      makingRequest: boolean;

      constructor(props) {
        super(props);

        this.state = {
          currentUser: undefined, isLoading: true, error: undefined,
          networkFetchComplete: false
        };
      }

      componentDidMount() {
        this.fetchCurrentUser();


      }

      componentDidUpdate(previousProps, previousState) {
        this.fetchCurrentUser();
      }

      fetchCurrentUser = async () => {
        if (this.makingRequest) { return; }
        const { error, networkFetchComplete, currentUser } = this.state;

        const { updateStore, usersMatchingLoggedInUser: fromCache, t } = this.props;
        const auth0IdFromJWT = getAuth0Id();

        // if we have a currentUser from cache, and the currentUser
        // matches the auth0Id we have from the JWT, then don't
        // make a network request.
        //
        // NOTE: this whole lifecycle hook is kind of a hack for lack
        //       of a better 'get the current user' pattern.
        const userFromCache = fromCache && fromCache[0];
        const cacheId = attributesFor(userFromCache).auth0Id;
        const existingId = attributesFor(currentUser).auth0Id;

        if (cacheId === auth0IdFromJWT && existingId !== cacheId) {
          this.setState({ currentUser: userFromCache, isLoading: false, networkFetchComplete: true });
          return;
        }

        if (error || networkFetchComplete) { return; }

        try {
          this.makingRequest = true;

          const response = await authenticatedGet([
            '/api/users/current-user',
            '?include=organization-memberships.organization,group-memberships.group'
          ].join(''));

          const status = response.status;
          const unauthorized = status === 401;

          if (status === 403 || status === 401) {
            const errorJson = await tryParseJson(response);
            const error = firstError(errorJson).title;
            const defaultMessage = unauthorized ? t('errors.notAuthorized') : t('errors.userForbidden');

            deleteToken();
            throw new Error(error || defaultMessage);
          }

          if (status >= 500) {
            const text = await response.text();
            throw new ServerError(status, text);
          }

          const json = await tryParseJson(response);

          await pushPayload(updateStore, json);

          console.debug('Current User Data has been fetched');
          // this state value isn't used anywhere, but we need to trigger
          // a re-render once the current user data has finished being consumed
          this.makingRequest = false;
          this.setState({ networkFetchComplete: true });
        } catch (e) {
          console.debug('error', e);

          this.setState({ error: e, networkFetchComplete: true });
        }

      }

      render() {
        const { error, currentUser, isLoading } = this.state;

        if (error) {
          if (error.status && error.status >= 500) {
            return <PageError error={error} />;
          }

          if (options.redirectOnFailure) {
            toast.error(error);

            return <Redirect push={true} to={'/login'} />;
          }

          return <PageError error={error} />;
        }

        if (isLoading) {
          return <PageLoader />;
        } else if (currentUser) {
          const hasMembership = hasRelationship(currentUser, 'organizationMemberships');

          if (hasMembership) {
            return <InnerComponent {...this.props} currentUser={currentUser} />;
          }

          return <Redirect push={true} to={'/organization-membership-required'} />;
        }

        // TODO: would it ever make sense to do an inline login instead of a redirect?
        return <Redirect push={true} to={'/login'} />;
      }
    }

    return compose(
      withData(mapRecordsToProps),
      withTranslations
    )(WrapperClass);
  };
}
