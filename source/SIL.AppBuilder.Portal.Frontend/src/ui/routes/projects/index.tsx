import * as React from 'react';
import { Switch } from 'react-router-dom';
import { NotFound } from '@ui/routes/errors';

import AllProjectsRoute, { pathName as allProjectPath } from './list/all';
import MyProjectsRoute, { pathName as myProjectPath } from './list/my-projects';
import ActiveProjectsRoute, { pathName as activeProjectPath } from './list/active-projects';
import OrganizationProjectsRoute, {
  pathName as organizationProjectPath,
} from './list/organization-projects';
import ArchivedProjectsRoute, { pathName as archivedProjectPath } from './list/archived-projects';
import NewProjectRoute, { pathName as newProjectPath } from './new';
import ImportProjectsRoute, { pathName as importProjectsPath } from './import';
import ProjectDetailRoute, { pathName as projectDetailPath } from './show';
import ProjectEditRoute, { pathName as projectEditPath } from './edit';

import { Route } from '~/lib/routing';

export default function ProjectsRoot() {
  return (
    <div className='ui container'>
      <Switch>
        <Route exact path={myProjectPath} component={MyProjectsRoute} />
        <Route exact path={organizationProjectPath} component={OrganizationProjectsRoute} />
        <Route exact path={archivedProjectPath} component={ArchivedProjectsRoute} />
        <Route exact path={newProjectPath} component={NewProjectRoute} />
        <Route exact path={importProjectsPath} component={ImportProjectsRoute} />
        <Route exact path={allProjectPath} component={AllProjectsRoute} />
        <Route exact path={activeProjectPath} component={ActiveProjectsRoute} />
        <Route exact path={projectEditPath} component={ProjectEditRoute} />

        <Route path={projectDetailPath} component={ProjectDetailRoute} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
