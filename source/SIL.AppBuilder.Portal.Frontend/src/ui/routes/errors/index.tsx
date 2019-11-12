import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFoundRoute, { pathName as notFoundPath } from './not-found';
import OrgMembershipRequired, { pathName as orgRequiredPath } from './org-membership-required';
import NotActiveUser, { pathName as notActiveUserPath } from './not-active-user';
import VerifyEmail, { pathName as verifyEmailPath } from './verify-email';
export const NotFound = NotFoundRoute;

export default class ErrorsRootRoute extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={notFoundPath} component={NotFoundRoute} />
        <Route exact path={orgRequiredPath} component={OrgMembershipRequired} />
        <Route exact path={notActiveUserPath} component={NotActiveUser} />
        <Route exact path={verifyEmailPath} component={VerifyEmail} />
        <Route component={NotFoundRoute} />
      </Switch>
    );
  }
}
