import * as React from 'react';
import * as uuid from 'uuid';

import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

export default class Lock extends React.Component<IProps> {
  state = { loggedIn : false };
  lockContainerId: string;

  componentWillMount() {
    this.lockContainerId = uuid();
  }

  componentDidMount() {
    const lock = getAuth0LockInstance({ container: this.lockContainerId});

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
    return <div id={this.lockContainerId} />;
  }
}
