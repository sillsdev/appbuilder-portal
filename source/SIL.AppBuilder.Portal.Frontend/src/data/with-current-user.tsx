import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import  { keyMap } from '@data/schema';
import { getAuth0Id } from '@lib/auth0';

type UserPayload = JSONAPI<UserAttributes>;

const mapRecordsToProps = {
  currentUser: q => q.findRecord({ id: 'current-user', type: TYPE_NAME })
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
        const { queryStore } = this.props;

        // this only needs to be done for the current-user
        // since we give 0 cares about the real id
        // (at least for the context of a "current user")
        const auth0IdFromJWT = getAuth0Id();
        console.log('key to keymap', auth0IdFromJWT);
        keyMap.pushRecord({
          id: 'current-user',
          type: TYPE_NAME,
          keys: { auth0Id: auth0IdFromJWT }
        });

        const currentUser = await queryStore(q => q.findRecord({
          id: 'current-user',
          type: TYPE_NAME
        }));

        if (currentUser) {
          this.setState({ currentUser });
          return;
        }

        // There is no current user. Redirect to login.
        // NOTE: because the backend does findOrCreate with the
        //     auth0Id, this should never happen.
        //     but it could if the network request fails or
        //     if there is a server error.
        //
        this.setState({ notFound: true });
      }

      render() {
        const { currentUser, notFound } = this.state;

        if (currentUser) {
          return <InnerComponent {...this.props} />;
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
