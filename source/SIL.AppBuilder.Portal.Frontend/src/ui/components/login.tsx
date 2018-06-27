import * as React from 'react';

import { getAuth0LockInstance, setToken, showLock, hideLock } from '@lib/auth0';

export default class Lock extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loggedIn : false };
  }

  componentDidMount() {
    const lock = getAuth0LockInstance();

    lock.on('authenticated', (authResult) => {
      console.log(authResult);

      setToken(authResult.idToken);

      lock.hide();
    });
  }

  componentWillUnmount() {
    hideLock();
  }


  render() {
    return(
      <div>
        <h2>Login Page</h2>
        <button
          className='ui button'
          onClick={showLock}>Open Login</button>
      </div>
    );
  }
}
