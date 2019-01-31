import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import LoginRoute, { pathName as loginPath } from '@ui/routes/login';
import TasksRoute, { pathName as tasksPath } from '@ui/routes/tasks';
import AdminRoute, { pathName as adminPath } from '@ui/routes/admin';
import InvitationsRoute, { pathName as invitationsPath } from '@ui/routes/invitations';
import RequestOrgAccessRoute, {
  pathName as requestOrgAccessPath,
} from '@ui/routes/request-access-for-organization';
import RequestOrgAccessSuccessRoute, {
  pathName as requestOrgAccessSuccessPath,
} from '@ui/routes/request-access-for-organization/success';
import OrganizationsRoute, { pathName as organizationsPath } from '@ui/routes/organizations';
import DirectoryRoute, { pathName as directoryPath } from '@ui/routes/project-directory';
import ProjectsRoute, { pathName as projectsPath } from '@ui/routes/projects';
import UsersRoute, { pathName as usersPath } from '@ui/routes/users';
import OpenSourceRoute, { pathName as openSourcePath } from '@ui/routes/open-source';
import ErrorRootRoute from '@ui/routes/errors';

import Workflow from './workflow';

export default class RootPage extends React.Component {
  render() {
    return (
      <div className='app-container flex-column align-items-stretch'>
        <div className='ui container'>
          {/* <Notifications /> */}
          <ToastContainer draggable={false} />
        </div>

        <section className='flex flex-grow'>
          <Switch>
            <Route path={loginPath} component={LoginRoute} />
            <Route path={adminPath} component={AdminRoute} />

            <Route exact path={rootPath} component={IndexRoute} />
            <Route path={tasksPath} component={TasksRoute} />
            <Route path={invitationsPath} component={InvitationsRoute} />

            <Route exact path={requestOrgAccessPath} component={RequestOrgAccessRoute} />
            <Route path={requestOrgAccessSuccessPath} component={RequestOrgAccessSuccessRoute} />

            <Route path={organizationsPath} component={OrganizationsRoute} />

            <Route path={directoryPath} component={DirectoryRoute} />
            <Route path={projectsPath} component={ProjectsRoute} />

            <Route path={usersPath} component={UsersRoute} />

            <Route path={openSourcePath} component={OpenSourceRoute} />

            <Route path={'/form'} component={Workflow} />
            <Route path={'/flow'} component={Workflow} />

            <Route component={ErrorRootRoute} />
          </Switch>
        </section>
      </div>
    );
  }
}
