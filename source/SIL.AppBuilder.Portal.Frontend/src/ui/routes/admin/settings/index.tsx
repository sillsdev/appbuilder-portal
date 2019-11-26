import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import { paths as adminPaths } from '@ui/routes/admin/paths';

import { withAdminLayout } from './-components/layout';
import OrganizationsRoute from './organizations';
import WorkflowDefinitionsRoute from './workflow-definitions';
import ProductDefinitionsRoute from './product-definitions';
import StoreTypesRoute from './store-types';
import StoreRoute from './stores';

const paths = adminPaths.settings;

function AdminSettingsRoute() {
  return (
    <Switch>
      <Route path={paths.organizations.path()} component={OrganizationsRoute} />
      <Route path={paths.workflowDefinitions.path()} component={WorkflowDefinitionsRoute} />
      <Route path={paths.productDefinitions.path()} component={ProductDefinitionsRoute} />
      <Route path={paths.stores.path()} component={StoreRoute} />
      <Route path={paths.storeTypes.path()} component={StoreTypesRoute} />
    </Switch>
  );
}

export default withAdminLayout(AdminSettingsRoute);
