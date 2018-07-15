import * as React from 'react';
import * as uuid from 'uuid';

import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export interface IProps {
  afterLogin: () => void;
}

export default class Lock extends React.Component<IProps> {
  state = { loggedIn : false };
  lockRef: any;

  constructor(props) {
    super(props);

    this.lockRef = React.createRef();
  }

  componentDidMount() {
    console.log(this.lockRef);
    const lock = getAuth0LockInstance({ container: this.lockRef.current.id });

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
    return <div ref={this.lockRef} id={uuid()} />;
  }
}
