import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import DownloadProducts, { pathName as downloadProductsPath } from './products';

export default function DownloadsRootRoute() {
  return (
    <div className='ui container'>
      <Switch>
        <Route exact path={downloadProductsPath} component={DownloadProducts} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
