import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

import NotFoundRoute from '@ui/routes/errors/not-found';
import CreateOrganizationRoute, { pathName as createPath } from './create-organization';
import MissingTokenRoute, { pathName as missingTokenPath } from './missing-token';
import JoinOrganizatinoRoute, { pathName as joinOrganizationPath } from './join-organization';
export const pathName = '/invitations';

export default class InvitationsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={createPath} component={CreateOrganizationRoute} />
        <Route exact path={missingTokenPath} component={MissingTokenRoute} />
        <Route exact path={joinOrganizationPath} component={JoinOrganizatinoRoute} />
        <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}
