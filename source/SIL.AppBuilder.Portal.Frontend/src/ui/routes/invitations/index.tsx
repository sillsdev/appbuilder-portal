import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import NotFoundRoute from '@ui/routes/errors/not-found';

import CreateOrganizationRoute, { pathName as createPath } from './create-organization';
import MissingTokenRoute, { pathName as missingTokenPath } from './missing-token';
import JoinOrganizationRoute, { pathName as joinOrganizationPath } from './join-organization';
import JoinOrganizationFinishedRoute, {
  pathName as joinOrganizationFinishedPath,
} from './join-organization/finished';


export default class InvitationsRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={createPath} component={CreateOrganizationRoute} />
        <Route exact path={missingTokenPath} component={MissingTokenRoute} />
        <Route exact path={joinOrganizationPath} component={JoinOrganizationRoute} />
        <Route
          exact
          path={joinOrganizationFinishedPath}
          component={JoinOrganizationFinishedRoute}
        />
        <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}
