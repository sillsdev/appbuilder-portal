import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';

import InviteOrganization from './invite-organization';

export const pathName = '/admin';

class AdminRoute extends React.Component {
  render() {
    return (
      <div>
        <InviteOrganization />
      </div>
    );
  }
}


export default compose(
  requireAuth
)(AdminRoute);
