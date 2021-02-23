import * as React from 'react';
import { Switch } from 'react-router-dom';

import { Route } from '~/lib/routing';

import NotFoundRoute from '@ui/routes/errors/not-found';

import CreateOrganizationRoute, { pathName as createPath } from './create-organization';
import MissingTokenRoute, { pathName as missingTokenPath } from './missing-token';
import JoinOrganizationRoute, { pathName as joinOrganizationPath } from './join-organization';

export default class InvitationsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={createPath} component={CreateOrganizationRoute} />
        <Route exact path={missingTokenPath} component={MissingTokenRoute} />
        <Route exact path={joinOrganizationPath} component={JoinOrganizationRoute} />

        <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}
