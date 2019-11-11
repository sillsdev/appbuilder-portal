import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import { NotFound } from '@ui/routes/errors';

import ListRoute, { pathName as listPath } from './list';
import ShowRoute, { pathName as showPath } from './show';
import EditRoute, { pathName as editPath } from './edit';
import NewEditRoute, { pathName as newEditPath } from './newedit';

export default function UsersRoot() {
  return (
    <Switch>
      <Route exact path={listPath} component={ListRoute} />
      <Route exact path={showPath} component={ShowRoute} />
      <Route path={editPath} component={EditRoute} />
      <Route path={newEditPath} component={NewEditRoute} />

      <Route component={NotFound} />
    </Switch>
  );
}
