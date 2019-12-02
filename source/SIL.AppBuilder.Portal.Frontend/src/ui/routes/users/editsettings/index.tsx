import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import SettingsRoute, { pathName as settingsPath } from './settings';
export const editSettingsPath = '/users/:userId/editsettings';

export default function UserEditRouter() {
  return (
    <Switch>
      <Route path={editSettingsPath} component={SettingsRoute} />
      <Route path={settingsPath} component={SettingsRoute} />
    </Switch>
  );
}
