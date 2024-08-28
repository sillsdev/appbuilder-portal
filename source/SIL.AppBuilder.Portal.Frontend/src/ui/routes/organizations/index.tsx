import * as React from 'react';
import { Switch } from 'react-router-dom';

import SettingsRoute, { pathName as settingsPath } from './settings';

import { Route } from '~/lib/routing';

export default function OrganizationsRouter() {
  return (
    <Switch>
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
