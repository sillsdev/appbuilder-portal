import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import { NotFound } from '@ui/routes/errors';

import FilesShowRoute, { pathName as filesShowPath } from './show';

export default function FilesRoute() {
  return (
    <div className='ui container'>
      <Switch>
        <Route path={filesShowPath} component={FilesShowRoute} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
