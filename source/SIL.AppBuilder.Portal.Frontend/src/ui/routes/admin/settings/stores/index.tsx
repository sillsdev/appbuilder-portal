import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { paths as adminPaths } from '@ui/routes/admin/paths';

import List from './list';
import Form from './new';
import Edit from './edit';

const paths = adminPaths.settings.stores;

export default function StoresRoute() {
  return (
    <div className='sub-page-content' data-test-admin-stores>
      <Switch>
        <Route exact path={paths.path()} component={List} />
        <Route path={paths.create.path()} component={Form} />
        <Route path={paths.edit.path()} component={Edit} />
      </Switch>
    </div>
  );
}
