import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFoundRoute from '@ui/routes/errors/not-found';

import CreateOrganizationRoute, { pathName as createPath } from './create-organization';
import MissingTokenRoute, { pathName as missingTokenPath } from './missing-token';

export const pathName = '/invitations';

export default class InvitationsRoute extends React.Component {
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
