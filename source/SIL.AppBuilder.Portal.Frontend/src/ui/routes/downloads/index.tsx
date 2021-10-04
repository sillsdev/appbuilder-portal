import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import DownloadProducts, { pathName as downloadProductsPath } from './products';
import DownloadApk, { pathName as downloadApkPath } from './apk';

export default function DownloadsRootRoute() {
  return (
    <div className='ui container flex-100'>
      <Switch>
        <Route exact path={downloadProductsPath} component={DownloadProducts} />
        <Route exact path={downloadApkPath} component={DownloadApk} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
