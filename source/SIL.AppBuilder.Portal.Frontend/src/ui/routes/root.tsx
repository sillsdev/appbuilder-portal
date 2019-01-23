import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import IndexRoute, { pathName as rootPath } from '@ui/routes/index';
import TasksRoute, { pathName as tasksPath } from '@ui/routes/tasks';

import RequestOrgAccessRoute, {
  pathName as requestOrgAccessPath,
} from '@ui/routes/request-access-for-organization';
import RequestOrgAccessSuccessRoute, {
  pathName as requestOrgAccessSuccessPath,
} from '@ui/routes/request-access-for-organization/success';

import OpenSourceRoute, { pathName as openSourcePath } from '@ui/routes/open-source';
import ErrorRootRoute from '@ui/routes/errors';

import { PageLoader } from '@ui/components/loaders';
import { ErrorBoundary } from '@ui/components/errors';

import Workflow from './workflow';
import * as paths from './paths';

const LoginRoute = React.lazy(() => import('@ui/routes/login'));
const AdminRoute = React.lazy(() => import('@ui/routes/admin'));
const InvitationsRoute = React.lazy(() => import('@ui/routes/invitations'));
const OrganizationsRoute = React.lazy(() => import('@ui/routes/organizations'));
const UsersRoute = React.lazy(() => import('@ui/routes/users'));
const DirectoryRoute = React.lazy(() => import('@ui/routes/project-directory'));
const ProjectsRoute = React.lazy(() => import('@ui/routes/projects'));


export default class RootPage extends React.Component {
  render() {
    return (
      <div className='app-container flex-column align-items-stretch'>
        <div className='ui container'>
          {/* <Notifications /> */}
          <ToastContainer draggable={false} />
        </div>

        <section className='flex flex-grow'>
          <React.Suspense fallback={PageLoader}>
            <ErrorBoundary>
              <Switch>
                <Route path={paths.loginPath} component={LoginRoute} />
                <Route path={paths.adminPath} componentPath={AdminRoute} />

                <Route exact path={rootPath} component={IndexRoute} />
                <Route path={tasksPath} component={TasksRoute} />
                <Route path={paths.invitationsPath} componentPath={InvitationsRoute} />

                <Route exact path={requestOrgAccessPath} component={RequestOrgAccessRoute} />
                <Route
                  path={requestOrgAccessSuccessPath}
                  component={RequestOrgAccessSuccessRoute}
                />

                <Route path={paths.organizationsPath} componentPath={OrganizationsRoute} />

                <Route path={paths.directoryPath} component={DirectoryRoute} />
                <Route path={paths.projectsPath} component={ProjectsRoute} />

                <Route path={paths.usersPath} component={UsersRoute} />

                <Route path={openSourcePath} component={OpenSourceRoute} />

                <Route path={'/form'} component={Workflow} />
                <Route path={'/flow'} component={Workflow} />

                <Route component={ErrorRootRoute} />
              </Switch>
            </ErrorBoundary>
          </React.Suspense>
        </section>
      </div>
    );
  }
}
