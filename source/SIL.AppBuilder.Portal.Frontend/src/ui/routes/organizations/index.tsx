import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import SettingsRoute, { pathName as settingsPath } from './settings';

export default function OrganizationsRouter() {
  return (
    <Switch>
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
