import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import SettingsRoute, { pathName as settingsPath } from './settings';

export default function OrganizationsRouter() {
  return (
    <Switch>
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
