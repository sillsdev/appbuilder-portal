import * as React from 'react';
import { compose } from 'recompose';

import { withAdminLayout } from '@ui/components/layout/admin';

import { Switch, Route } from 'react-router-dom';
import OrganizationsRoute from '@ui/routes/admin/settings/organizations';

export const pathName = '/admin/settings';

class AdminSettingsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={pathName} component={OrganizationsRoute} />
      </Switch>
    );
  }
}

export default compose(
  withAdminLayout,
)(AdminSettingsRoute);