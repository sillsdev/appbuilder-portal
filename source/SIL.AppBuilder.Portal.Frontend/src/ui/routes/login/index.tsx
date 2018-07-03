import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouterProps } from 'react-router';

import { requireNoAuth } from '@lib/auth';
import Login from '@ui/components/login';

export const pathName = '/login';

class LoginRoute extends React.Component<RouterProps> {
  state = { data: {}, errors: {} };
  render() {
    const { history } = this.props;

    return (
      <div>
        <h2>Login Route </h2>

        <Login afterLogin={() => history.push('/tasks')}/>
      </div>
    );
  }
}

export default compose(
  withRouter,
  requireNoAuth('/')
)(LoginRoute);
