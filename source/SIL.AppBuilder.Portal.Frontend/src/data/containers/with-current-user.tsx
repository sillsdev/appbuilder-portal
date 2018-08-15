import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import Orbit from '@orbit/data';

import { defaultSourceOptions, pushPayload } from '@data';
import  { keyMap } from '@data/schema';
import { serializer } from '@data/store';
import { UserAttributes, TYPE_NAME } from '@data/models/user';

import { getAuth0Id } from '@lib/auth0';
import { get as authenticatedGet } from '@lib/fetch';
import { hasRelationship } from '@data';

import PageLoader from '@ui/components/loaders/page';
import OrgMembershipRequired from '@ui/components/errors/org-membership-required';
import PageError from '@ui/components/errors/page';

type UserPayload = JSONAPIDocument<UserAttributes>;

const mapRecordsToProps = () => {
  const auth0Id = getAuth0Id();

  return {
    usersMatchingLoggedInUser: q => q.findRecords(TYPE_NAME)
      .filter({ attribute: 'auth0Id', value: auth0Id })
  };
};

interface IProps {
  usersMatchingLoggedInUser: UserPayload;
}

interface IState {
  currentUser: UserPayload;
  isLoading: boolean;
  error?: any;
  networkFetchComplete: boolean;
}

// TODO: store the attempted URL so that after login,
//     we can navigate back.
export function withCurrentUser() {
  return InnerComponent => {
    class WrapperClass extends React.Component<IProps & WithDataProps, IState> {
      state = {
        currentUser: undefined, isLoading: true, error: undefined,
        networkFetchComplete: false
      };

      // TODO: remove this when the below linked github issue is resolved
      getOrganizations = async (user) => {
        const { queryStore } = this.props;
        const included = user.included || [];
        const memberships = included.filter(i => i.type === 'organization-memberships');


        // TODO: this currently gets all organizations
        //       remove when we have nested includes supports.
        return await queryStore(
          q => q.findRecords('organization'), {
          sources: {
            remote: {
              include: 'groups',
              settings: {
                ...defaultSourceOptions()
              },
            }
          }
         });
      }

      componentDidMount() {
        this.fetchCurrentUser();
      }

      fetchCurrentUser = async () => {
        const { updateStore, queryStore, usersMatchingLoggedInUser: fromCache } = this.props;
        const auth0IdFromJWT = getAuth0Id();

        // if we have a currentUser from cache, and the currentUser
        // matches the auth0Id we have from the JWT, then don't
        // make a network request.
        //
        // NOTE: this whole lifecycle hook is kind of a hack for lack
        //       of a better 'get the current user' pattern.
        const userFromCache = fromCache && fromCache[0];

        if (userFromCache) {
          this.setState({ currentUser: userFromCache, isLoading: false });
          return;
        }

        try {
          // TOOD: add nested include when:
          // https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
          // is resolved
          const response = await authenticatedGet('/api/users/current-user?include=organization-memberships,group-memberships');
          const json = await response.json();

          await pushPayload(updateStore, json);
          await this.getOrganizations(json);

          console.debug('Current User Data has been fetched');
          // this state value isn't used anywhere, but we need to trigger
          // a re-render once the current user data has finished being consumed
          this.setState({ networkFetchComplete: true });
        } catch (e) {
          console.debug('error', e);

          this.setState({ error: e });
        }

      }

      render() {
        const { error, currentUser, isLoading } = this.state;

        if (error) {
          return <PageError error={error} />;
        }

        if (isLoading) {
          return <PageLoader />;
        } else if (currentUser) {
          const hasMembership = hasRelationship(currentUser, 'organizationMemberships');

          if (hasMembership) {
            return <InnerComponent {...this.props} currentUser={currentUser} />;
          }

          return <OrgMembershipRequired />;
        }

        // TODO: would it ever make sense to do an inline login instead of a redirect?
        return <Redirect to={'/login'} />;
      }
    }

    return compose(
      withData(mapRecordsToProps)
    )(WrapperClass);
  };
}
