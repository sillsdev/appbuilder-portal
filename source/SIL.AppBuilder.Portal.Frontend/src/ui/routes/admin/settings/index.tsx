import * as React from 'react';
import { Switch } from 'react-router-dom';
import { paths as adminPaths } from '@ui/routes/admin/paths';

import { withAdminLayout } from './-components/layout';
import OrganizationsRoute from './organizations';
import WorkflowDefinitionsRoute from './workflow-definitions';
import ProductDefinitionsRoute from './product-definitions';
import StoreTypesRoute from './store-types';
import StoreRoute from './stores';
import BuildEnginesRoute from './build-engines';

import { Route } from '~/lib/routing';

const paths = adminPaths.settings;

function AdminSettingsRoute() {
  return (
    <Switch>
      <Route path={paths.organizations.path()} component={OrganizationsRoute} />
      <Route path={paths.workflowDefinitions.path()} component={WorkflowDefinitionsRoute} />
      <Route path={paths.productDefinitions.path()} component={ProductDefinitionsRoute} />
      <Route path={paths.stores.path()} component={StoreRoute} />
      <Route path={paths.storeTypes.path()} component={StoreTypesRoute} />
      <Route path={paths.buildEngines.path()} component={BuildEnginesRoute} />
    </Switch>
  );
}

export default withAdminLayout(AdminSettingsRoute);
