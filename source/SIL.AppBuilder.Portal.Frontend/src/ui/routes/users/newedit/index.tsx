import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import SettingsRoute, { pathName as settingsPath } from './settings';
export const pathName = '/users/:userId/newedit';

export default function UserEditRouter() {
  return (
    <Switch>
      <Route path={pathName} component={SettingsRoute} />
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
