import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

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

export default OrganizationsRoute;
