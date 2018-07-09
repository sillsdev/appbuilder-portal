import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouterProps } from 'react-router';

import { requireNoAuth } from '@lib/auth';
import AutoMountingLock from './auth0-lock-auto-mount';

export const pathName = '/login';

class LoginRoute extends React.Component<RouterProps> {
  state = { data: {}, errors: {} };
  render() {
    const { history } = this.props;

    return (
      <div className='bg-blue flex-grow flex-column justify-content-space-between align-items-center'>
        <div className='flex flex-grow justify-content-center align-items-center'>
          <AutoMountingLock afterLogin={() => history.push('/tasks')}/>
        </div>

        <span className='white-text m-b-md'>
          Would you like to sign up your organization?&nbsp;
          <a className='white-text bold'>Contact Us</a>
        </span>
      </div>
    );
  }
}

export default compose(
  withRouter,
  requireNoAuth('/')
)(LoginRoute);
