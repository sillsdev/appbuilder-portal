import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFoundRoute, { pathName as notFoundPath } from './not-found';
import OrgMembershipRequiredRoute, { pathName as orgMembershipRequiredPath } from './org-membership-required';

export default class ErrorsRootRoute extends React.Component {
  render() {
    return (
      <Switch>
          <Route exact path={notFoundPath} component={NotFoundRoute} />
          <Route exact path={orgMembershipRequiredPath} component={OrgMembershipRequiredRoute} />

          <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}
