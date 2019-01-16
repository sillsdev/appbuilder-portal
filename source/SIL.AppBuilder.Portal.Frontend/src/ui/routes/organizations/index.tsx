import * as React from 'react';
import { compose } from 'recompose';
import { requireAuth } from '@lib/auth';
import { Switch, Route } from 'react-router-dom';
import { withLayout } from '@ui/components/layout';

import SettingsRoute, { pathName as settingsPath } from './settings';

export const pathName = '/organizations';

class OrganizationsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={settingsPath} component={SettingsRoute} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth(),
  withLayout
)(OrganizationsRoute);
