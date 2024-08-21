import * as React from 'react';
import { Switch } from 'react-router-dom';

import SettingsRoute, { pathName as settingsPath } from './settings';

import { Route } from '~/lib/routing';

export const editSettingsPath = '/users/:userId/settings';

export default function UserEditRouter() {
  return (
    <Switch>
      <Route path={editSettingsPath} component={SettingsRoute} />
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
