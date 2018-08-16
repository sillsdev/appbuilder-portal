import * as React from 'react';
import { match as Match } from 'react-router';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import { NotFound } from '@ui/routes/errors';
import { withLayout } from '@ui/components/layout';

import MyProjectsRoute, { pathName as myProjectPath } from './my-projects';
import OrganizationProjectsRoute, { pathName as organizationProjectPath } from './organization-projects';
import ArchivedProjectsRoute, { pathName as archivedProjectPath } from './archived-projects';

import Header from './header';

export const pathName = '/projects';

class ProjectsRoot extends React.Component {

  render() {

    return (
      <div className='ui container'>
        <Switch>
          <Route exact path={myProjectPath} component={MyProjectsRoute} />
          <Route exact path={organizationProjectPath} component={OrganizationProjectsRoute} />
          <Route exact path={archivedProjectPath} component={ArchivedProjectsRoute} />

          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

export default compose(
  requireAuth,
  withLayout,
  withRouter
)(ProjectsRoot);
