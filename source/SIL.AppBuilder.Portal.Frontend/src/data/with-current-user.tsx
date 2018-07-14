import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import  { keyMap } from '@data/schema';

import { getAuth0Id } from '@lib/auth0';
import { get as authenticatedGet } from '@lib/fetch';

type UserPayload = JSONAPI<UserAttributes>;

const mapRecordsToProps = {
  // currentUser: q => q.findRecord({ id: 'current-user', type: TYPE_NAME })
}

interface IProps {
  currentUser: UserPayload;
}

interface IState {
  currentUser: UserPayload;
  notFound: boolean;
}

// TODO: store the attempted URL so that after login,
//     we can navigate back.
export function withCurrentUser() {
  return InnerComponent => {
    class WrapperClass extends React.Component<IProps & WithDataProps, IState> {
      state = { currentUser: undefined, notFound: false };

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
          this.setState({ currentUser: currentUserFromCache });
          return;
        }

        try {
          const response = await authenticatedGet('/api/users/current-user');
          const json = await response.json();

          // json.id = 'current-user';

          // await updateStore(s => s.addRecord(json));

          this.setState({ currentUser: json });
        } catch (e) {
          console.debug(e);

          // There is no current user. Redirect to login.
          // NOTE: because the backend does findOrCreate with the
          //     auth0Id, this should never happen.
          //     but it could if the network request fails or
          //     if there is a server error.
          //
          this.setState({ notFound: true });
        }
      }

      render() {
        const { currentUser, notFound } = this.state;

        if (currentUser) {
          return <InnerComponent {...this.props} currentUser={currentUser} />;
        } else if (notFound) {
          return <Redirect to={'/login'} />;
        }

        return 'Loading? what should we do here before we get the current user?';
      }
    }

    return compose(
      withData(mapRecordsToProps)
    )(WrapperClass);
  }
}
