import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import  { keyMap } from '@data/schema';
import { defaultSourceOptions } from '@data';
import Orbit from '@orbit/data';

import { getAuth0Id } from '@lib/auth0';
import { get as authenticatedGet } from '@lib/fetch';

import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

type UserPayload = JSONAPI<UserAttributes>;

const mapRecordsToProps = {
  // currentUser: q => q.findRecord({ id: 'current-user', type: TYPE_NAME })
};

interface IProps {
  currentUser: UserPayload;
}

interface IState {
  currentUser: UserPayload;
  isLoading: boolean;
  error?: any;
}

// TODO: store the attempted URL so that after login,
//     we can navigate back.
export function withCurrentUser() {
  return InnerComponent => {
    class WrapperClass extends React.Component<IProps & WithDataProps, IState> {
      state = { currentUser: undefined, isLoading: true, error: undefined };

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
              settings: {
                ...defaultSourceOptions()
              },
            }
          }
         });
      }

      async componentDidMount() {
        const { updateStore, queryStore, currentUser: fromCache } = this.props;
        const auth0IdFromJWT = getAuth0Id();

        // if we have a currentUser from cache, and the currentUser
        // matches the auth0Id we have from the JWT, then don't
        // make a network request.
        // TODO: there is probably a native orbit way to do this.
        // NOTE: this whole lifecycle hook is kind of a hack for lack
        //       of a better 'get the current user' pattern.
        if (fromCache && fromCache.attributes.auth0Id === auth0IdFromJWT) {
          this.setState({ currentUser: fromCache });
          return;
        }

        try {
          // TOOD: add nested include when:
          // https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
          // is resolved

          // TODO: find a way to push this data into the orbit store
          const response = await authenticatedGet('/api/users/current-user?include=organization-memberships');
          const json = await response.json();

          await this.getOrganizations(json);

          this.setState({ currentUser: json, isLoading: false });
        } catch (e) {
          console.debug('error', e);

          this.setState({ error: e });

          // There is no current user. Redirect to login.
          // NOTE: because the backend does findOrCreate with the
          //     auth0Id, this should never happen.
          //     but it could if the network request fails or
          //     if there is a server error.
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
          return <InnerComponent {...this.props} currentUser={currentUser} />;
        }

        return <Redirect to={'/login'} />;
      }
    }

    return compose(
      withData(mapRecordsToProps)
    )(WrapperClass);
  };
}
