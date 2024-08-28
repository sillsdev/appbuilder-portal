import * as React from 'react';
import { Switch } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import FilesRoute, { pathName as filesPath } from './files';

import { Route } from '~/lib/routing';

export default function ProductsRoute() {
  return (
    <div className='ui container'>
      <Switch>
        <Route path={filesPath} component={FilesRoute} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
