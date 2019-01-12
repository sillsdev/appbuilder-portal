import * as React from 'react';
import { match as Match } from 'react-router';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import { NotFound } from '@ui/routes/errors';
import { withLayout } from '@ui/components/layout';

import MyProjectsRoute, { pathName as myProjectPath } from './list/my-projects';
import OrganizationProjectsRoute, { pathName as organizationProjectPath } from './list/organization-projects';
import ArchivedProjectsRoute, { pathName as archivedProjectPath } from './list/archived-projects';
import NewProjectRoute, { pathName as newProjectPath } from './new';
import ProjectDetailRoute, { pathName as projectDetailPath } from './show';

export const pathName = '/projects';

class ProjectsRoot extends React.Component {
  render() {
    return (
      <div className='ui container'>
        <Switch>
          <Route exact path={myProjectPath} component={MyProjectsRoute} />
          <Route exact path={organizationProjectPath} component={OrganizationProjectsRoute} />
          <Route exact path={archivedProjectPath} component={ArchivedProjectsRoute} />
          <Route exact path={newProjectPath} component={NewProjectRoute} />

          <Route path={projectDetailPath} component={ProjectDetailRoute} />


          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

export default compose(
  requireAuth(),
  withLayout,
  withRouter,
)(ProjectsRoot);
