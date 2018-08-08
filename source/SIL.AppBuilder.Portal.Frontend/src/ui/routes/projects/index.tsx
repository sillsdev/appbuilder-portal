import * as React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import { NotFound } from '@ui/routes/errors';
import { withLayout } from '@ui/components/layout';

import MyProjectsRoute, { pathName as myProjectPath } from './my-projects';
import OrgProjectsRoute, { pathName as orgProjectsPath } from './org-projects';

export const pathName = '/projects';

class ProjectsRoot extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={orgProjectsPath} component={OrgProjectsRoute} />
        <Route exact path={myProjectPath} component={MyProjectsRoute} />

        <Route component={NotFound} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth,
  withLayout,
  withRouter
)(ProjectsRoot);