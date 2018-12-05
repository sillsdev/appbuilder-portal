import * as React from 'react';
import { compose } from 'recompose';

import { withAdminLayout } from '@ui/components/layout/admin';

import { Switch, Route } from 'react-router-dom';
import OrganizationsRoute from '@ui/routes/admin/settings/organizations';
import WorkflowDefinitionsRoute from '@ui/routes/admin/settings/workflow-definitions';

export const pathName = '/admin/settings';
export const workflowDefinitionsPathName = '/admin/settings/workflow-definitions';
export const organizationsPathName = '/admin/settings/organizations';

class AdminSettingsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={organizationsPathName} component={OrganizationsRoute} />
        <Route path={workflowDefinitionsPathName} component={WorkflowDefinitionsRoute} />
      </Switch>
    );
  }
}

export default compose(
  withAdminLayout,
)(AdminSettingsRoute);