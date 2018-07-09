import * as React from 'react';

import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

export default class Lock extends React.Component<IProps> {
  state = { loggedIn : false };

  componentDidMount() {
    const lock = getAuth0LockInstance();

    lock.on('authenticated', (authResult) => {
      setToken(authResult.idToken);

      lock.hide();
      this.props.afterLogin();
    });

    showLock();
  }

  componentWillUnmount() {
    hideLock();
  }

  render() {
    return null;
  }
}
