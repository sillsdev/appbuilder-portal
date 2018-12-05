import * as React from 'react';
import { compose } from 'recompose';

import { withAdminLayout } from '@ui/components/layout/admin';

import { Switch, Route } from 'react-router-dom';
import OrganizationsRoute from '@ui/routes/admin/settings/organizations';
import WorkflowDefinitionsRoute from '@ui/routes/admin/settings/workflow-definitions';

export const pathName = '/admin/settings';

class AdminSettingsRoute extends React.Component {
    render() {
    return (
      <Switch>
        <Route path={'/admin/settings/organizations'} component={OrganizationsRoute} />
        <Route path={'/admin/settings/workflow-definitions'} component={WorkflowDefinitionsRoute} />
      </Switch>
    );
  }
}

export default compose(
  withAdminLayout,
)(AdminSettingsRoute);