import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';

import InviteOrganization from './invite-organization';
import Header from '@ui/components/header/only-logo';

export const pathName = '/admin';

class AdminRoute extends React.Component {
  render() {
    return (
      <div className='flex flex-column flex-grow'>
        <Header/>
        <InviteOrganization />
      </div>
    );
  }
}


export default compose(
  requireAuth
)(AdminRoute);
