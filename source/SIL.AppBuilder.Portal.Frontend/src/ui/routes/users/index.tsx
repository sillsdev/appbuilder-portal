import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import ListRoute, { pathName as listPath } from './list';
import ShowRoute, { pathName as showPath } from './show';
import EditRoute, { pathName as editPath } from './edit';

export default function UsersRoot() {
  return (
    <Switch>
      <Route exact path={listPath} component={ListRoute} />
      <Route exact path={showPath} component={ShowRoute} />
      <Route path={editPath} component={EditRoute} />

      <Route component={NotFound} />
    </Switch>
  );
}
