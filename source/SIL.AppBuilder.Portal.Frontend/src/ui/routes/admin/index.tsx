import * as React from 'react';
import { compose } from 'recompose';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import { withRole } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';

import InviteOrganization from './invite-organization';
import AdminSettingsRoute from './settings';
import { paths } from './paths';

function AdminRoute() {
  return (
    <Switch>
      <Route exact path={paths.root.path()} component={InviteOrganization} />
      <Route path={paths.settings.path()} component={AdminSettingsRoute} />
    </Switch>
  );
}

export default compose(
  withRole(ROLE.SuperAdmin, {
    redirectTo: '/',
  })
)(AdminRoute);
