import * as React from 'react';
import { Switch } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import ListRoute, { pathName as listPath } from './list';
import ShowRoute, { pathName as showPath } from './show';
import EditRoute, { pathName as editPath } from './edit';
import EditSettingsRoute, { pathName as editSettingsPath } from './editsettings';

import { Route } from '~/lib/routing';

export default function UsersRoot() {
  return (
    <Switch>
      <Route exact path={listPath} component={ListRoute} />
      <Route exact path={showPath} component={ShowRoute} />
      <Route path={editPath} component={EditRoute} />
      <Route path={editSettingsPath} component={EditSettingsRoute} />

      <Route component={NotFound} />
    </Switch>
  );
}
