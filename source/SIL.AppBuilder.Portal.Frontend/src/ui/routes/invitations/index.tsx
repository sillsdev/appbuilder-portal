import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import NotFoundRoute from '@ui/routes/errors/not-found';

import { withLayout } from '@ui/components/layout';
import CreateOrganizationRoute, { pathName as createPath } from './create-organization';
import MissingTokenRoute, { pathName as missingTokenPath } from './missing-token';

export const pathName = '/invitations';

class InvitationsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={createPath} component={CreateOrganizationRoute} />
        <Route path={missingTokenPath} component={MissingTokenRoute} />

        <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth,
  withLayout
)(InvitationsRoute);
