import * as React from 'react';

import InviteOrganization from './invite-organization';

export const pathName = '/admin';

export default class AdminRoute extends React.Component {
  render() {
    return (
      <div>
        <InviteOrganization />
      </div>
    );
  }
}
