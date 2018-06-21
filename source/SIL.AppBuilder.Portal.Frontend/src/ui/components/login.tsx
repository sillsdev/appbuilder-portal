import * as React from 'react';
import Auth0Lock from 'auth0-lock';

import { auth0 } from '@env';

const lock = new Auth0Lock(auth0.clientId, auth0.domain, {
  auth: {
    responseType: 'token id_token',
    sso: false,
  }
});

lock.on('authenticated', (authResult) => {
  console.log(authResult);
});

export default class Lock extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loggedIn : false };

    lock.show();
  }

  render() {
    return(
      <div>
        <h2>Login Page</h2>
      </div>
    );
  }
}
