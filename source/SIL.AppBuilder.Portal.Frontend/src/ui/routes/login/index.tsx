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
      <div className='bg-blue flex-grow justify-content-center align-items-center'>
        <Login afterLogin={() => history.push('/tasks')}/>
      </div>
    );
  }
}

export default compose(
  withRouter,
  requireNoAuth('/')
)(LoginRoute);
