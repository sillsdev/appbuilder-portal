import * as React from 'react';
import { compose } from 'recompose';
import { withAdminLayout } from '@ui/components/layout/admin';
import { Switch, Route } from 'react-router-dom';
import OrganizationsRoute from '@ui/routes/admin/settings/organizations';
import WorkflowDefinitionsRoute from '@ui/routes/admin/settings/workflow-definitions';
import ProductDefinitionsRoute from '@ui/routes/admin/settings/product-definitions';
import StoreTypesRoute from '@ui/routes/admin/settings/store-types';

export const pathName = '/admin/settings';

class AdminSettingsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={'/admin/settings/organizations'} component={OrganizationsRoute} />
        <Route path={'/admin/settings/workflow-definitions'} component={WorkflowDefinitionsRoute} />
        <Route path={'/admin/settings/product-definitions'} component={ProductDefinitionsRoute} />
        <Route path={'/admin/settings/store-types'} component={StoreTypesRoute} />
      </Switch>
    );
  }
}

export default compose(withAdminLayout)(AdminSettingsRoute);
