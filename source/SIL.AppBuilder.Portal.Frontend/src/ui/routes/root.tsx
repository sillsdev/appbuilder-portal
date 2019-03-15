import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthConsumer } from '~/data/containers/with-auth';

import { LoadCurrentUser } from '~/data/containers/with-current-user';

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

import AuthenticatedLayout from '~/ui/components/layout';

import { VerifyAccess } from '~/ui/components/authorization/verify-access';

import { RoutesExist } from '~/ui/components/routing/routes-exist';

import Workflow from './workflow';
import * as paths from './paths';

export default function RootPage() {
  return (
    <div className='app-container flex-column align-items-stretch'>
      <div className='ui container'>
        <ToastContainer draggable={false} />
      </div>

      <section className='flex flex-grow'>
        <AuthConsumer>
          {({ isLoggedIn }) => {
            if (!isLoggedIn) {
              return <UnauthenticatedRoutes />;
            }

            return <AuthenticatedRoutes />;
          }}
        </AuthConsumer>
      </section>
    </div>
  );
}

function UnauthenticatedRoutes() {
  return (
    <>
      <RoutesExist
        paths={[
          paths.adminPath,
          paths.tasksPath,
          paths.organizationsPath,
          paths.directoryPath,
          paths.projectsPath,
          paths.usersPath,
          '/form',
          '/flow',
        ]}
      />

      <Switch>
        <Route exact path={paths.rootPath} component={() => <Redirect to={paths.loginPath} />} />

        <Route path={paths.loginPath} component={LoginRoute} />
        <Route path={paths.invitationsPath} component={InvitationsRoute} />
        <Route path={paths.openSourcePath} component={OpenSourceRoute} />

        <Route exact path={paths.requestOrgAccessPath} component={RequestOrgAccessRoute} />
        <Route path={paths.requestOrgAccessSuccessPath} component={RequestOrgAccessSuccessRoute} />

        <Route component={ErrorRootRoute} />
      </Switch>
    </>
  );
}

function AuthenticatedRoutes() {
  return (
    <>
      <VerifyAccess />
      <LoadCurrentUser>
        <AuthenticatedLayout>
          <RoutesExist
            paths={[
              paths.loginPath,
              `${paths.invitationsPath}/organization`,
              `${paths.invitationsPath}/missing-token`,

              paths.openSourcePath,
              paths.requestOrgAccessPath,
              paths.requestOrgAccessSuccessPath,
            ]}
          />

          <Switch>
            <Route
              exact
              path={paths.rootPath}
              component={() => <Redirect push={true} to={paths.tasksPath} />}
            />

            <Route path={paths.adminPath} component={AdminRoute} />
            <Route path={paths.tasksPath} component={TasksRoute} />
            <Route path={paths.organizationsPath} component={OrganizationsRoute} />

            <Route path={paths.directoryPath} component={DirectoryRoute} />
            <Route path={paths.projectsPath} component={ProjectsRoute} />

            <Route path={paths.usersPath} component={UsersRoute} />

            <Route path={'/form'} component={Workflow} />
            <Route path={'/flow'} component={Workflow} />

            <Route component={ErrorRootRoute} />
          </Switch>
        </AuthenticatedLayout>
      </LoadCurrentUser>
    </>
  );
}
