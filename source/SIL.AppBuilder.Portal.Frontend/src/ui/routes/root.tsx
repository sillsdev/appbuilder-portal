import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import IndexRoute from '@ui/routes/index';
import LoginRoute from '@ui/routes/login';
import TasksRoute from '@ui/routes/tasks';
import AdminRoute from '@ui/routes/admin';
import InvitationsRoute from '@ui/routes/invitations';
import RequestOrgAccessRoute from '@ui/routes/request-access-for-organization';
import RequestOrgAccessSuccessRoute from '@ui/routes/request-access-for-organization/success';
import OrganizationsRoute from '@ui/routes/organizations';
import DirectoryRoute from '@ui/routes/project-directory';
import ProjectsRoute from '@ui/routes/projects';
import UsersRoute from '@ui/routes/users';
import OpenSourceRoute from '@ui/routes/open-source';
import ErrorRootRoute from '@ui/routes/errors';

import Workflow from './workflow';
import * as paths from './paths';

export default class RootPage extends React.Component {
  render() {
    return (
      <div className='app-container flex-column align-items-stretch'>
        <div className='ui container'>
          <ToastContainer draggable={false} />
        </div>

        <section className='flex flex-grow'>
          <Switch>
            <Route path={paths.loginPath} component={LoginRoute} />
            <Route path={paths.adminPath} component={AdminRoute} />

            <Route exact path={paths.rootPath} component={IndexRoute} />
            <Route path={paths.tasksPath} component={TasksRoute} />
            <Route path={paths.invitationsPath} component={InvitationsRoute} />

            <Route exact path={paths.requestOrgAccessPath} component={RequestOrgAccessRoute} />
            <Route
              path={paths.requestOrgAccessSuccessPath}
              component={RequestOrgAccessSuccessRoute}
            />

            <Route path={paths.organizationsPath} component={OrganizationsRoute} />

            <Route path={paths.directoryPath} component={DirectoryRoute} />
            <Route path={paths.projectsPath} component={ProjectsRoute} />

            <Route path={paths.usersPath} component={UsersRoute} />

            <Route path={paths.openSourcePath} component={OpenSourceRoute} />

            <Route path={'/form'} component={Workflow} />
            <Route path={'/flow'} component={Workflow} />

            <Route component={ErrorRootRoute} />
          </Switch>
        </section>
      </div>
    );
  }
}
