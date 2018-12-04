import * as React from 'react';
import { compose } from 'recompose';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import InviteOrganization from './invite-organization';
import SettingsRoute, { pathName as settingsPathName } from './settings';

export const pathName = '/admin';

class AdminRoute extends React.Component {
  render() {

    return (
      <Switch>
        <Route exact path={pathName} render={(routeProps) => (
          <InviteOrganization {...routeProps} />
        )} />
        <Route path={settingsPathName} render={(routeProps) => (
          <SettingsRoute {...routeProps} />
        )} />
      </Switch>
    );
  }
}


export default compose(
  requireAuth
)(AdminRoute);
