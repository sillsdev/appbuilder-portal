import * as React from 'react';
import { compose } from 'recompose';
import { Switch, Route } from 'react-router-dom';
import { requireAuth } from '@lib/auth';
import { withRole } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';
import { adminPath } from '@ui/routes/paths';

import InviteOrganization from './invite-organization';
import AdminSettingsRoute, { pathName as settingsPathName } from './settings';


class AdminRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={adminPath} component={InviteOrganization} />
        <Route path={settingsPathName} component={AdminSettingsRoute} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth(),
  withRole(ROLE.SuperAdmin, {
    redirectTo: '/',
  })
)(AdminRoute);
