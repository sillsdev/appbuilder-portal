import * as React from 'react';

import Login from '@ui/components/login';

export const pathName = '/login';

export default class LoginRoute extends React.Component {
  state = { data: {}, errors: {} };
  render() {
    return (
      <div>
        <h2>Login Route </h2>

        <Login />
      </div>
    );
  }
}
