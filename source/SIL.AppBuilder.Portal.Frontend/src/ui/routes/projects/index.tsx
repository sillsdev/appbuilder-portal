import * as React from 'react';
import { match as Match } from 'react-router';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import { NotFound } from '@ui/routes/errors';
import { withLayout } from '@ui/components/layout';

import MyProjectsTable from './my-projects-table';
import OrgProjectsTable from './org-projects-table';
import ArchivedProjectsTable from './archived-projects-table';

import Header from './header';

export const pathName = '/projects';

class ProjectsRoot extends React.Component {

  render() {

    return (
      <div className='ui container'>
        <Switch>
          <Route exact path='/projects/own' render={(routeProps) => (
            <>
              <Header filter='own'/>
              <MyProjectsTable/>
            </>
          )} />
          <Route exact path='/projects/organization' render={(routeProps) => (
            <>
              <Header filter='organization' />
              <OrgProjectsTable />
            </>
          )} />
          <Route exact path='/projects/archived' render={(routeProps) => (
            <>
              <Header filter='archived' />
              <ArchivedProjectsTable />
            </>
          )} />

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