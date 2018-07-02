import * as React from 'react';
import { compose } from 'recompose';

import { requireNoAuth } from '@lib/auth';
import Login from '@ui/components/login';

export const pathName = '/login';

class LoginRoute extends React.Component {
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

export default compose(
  requireNoAuth('/')
)(LoginRoute);
