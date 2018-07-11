import * as React from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import Notifications from 'react-notify-toast';


import { withAuthLayout as withLayout } from '@lib/routing';

import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import LoginRoute, { pathName as loginPath } from '@ui/routes/login';
import TasksRoute, { pathName as tasksPath} from '@ui/routes/tasks';
import AdminRoute, { pathName as adminPath} from '@ui/routes/admin';
import InvitationsRoute, { pathName as invitationsPath } from '@ui/routes/invitations';
import ProfileRoute, { pathName as profilePath } from '@ui/routes/profile';
import OrganizationsRoute, { pathName as organizationsPath } from '@ui/routes/organizations';

import ErrorRootRoute from '@ui/routes/errors';
import NotFoundRoute from '@ui/routes/errors/not-found';

export default class RootPage extends React.Component {
  render() {
    return (
      <div className='app-container flex-column align-items-stretch'>
        <Notifications />

        <section className='flex flex-grow'>
          <Switch>
            <Route path={loginPath} component={LoginRoute} />
            <Route path={adminPath} component={AdminRoute} />

            <Route exact path={rootPath} render={withLayout(IndexRoute)} />
            <Route path={tasksPath} component={withLayout(TasksRoute)} />
            <Route path={invitationsPath} component={withLayout(InvitationsRoute)} />
            <Route path={profilePath} component={withLayout(ProfileRoute)} />
            <Route path={organizationsPath} component={withLayout(OrganizationsRoute)} />

            <Route component={NotFoundRoute} />
          </Switch>


          <ErrorRootRoute />
        </section>

        <footer>
          <Link to={loginPath}>Login?</Link>
          &nbsp;|&nbsp;
          <Link to={rootPath}>Home?</Link>
          &nbsp;|&nbsp;
          <Link to={tasksPath}>Tasks?</Link>
          &nbsp;|&nbsp;
          <Link to={adminPath}>Admin</Link>
          &nbsp;|&nbsp;
          <Link to={invitationsPath}>Invitations?</Link>
        </footer>
      </div>
    );
  }
}
