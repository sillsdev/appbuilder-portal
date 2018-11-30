import * as React from 'react';

import List from './list';
import AddOrganizationForm from './new';
import EditOrganizationForm from './edit';

import { Switch, Route } from 'react-router-dom';

export const listPathName = '/admin/settings/organizations';
export const addOrganizationPathName = '/admin/settings/organizations/new';
export const editOrganizationPathName = '/admin/settings/organizations/:orgId/edit'

class OrganizationRoute extends React.Component {

  render() {
    return (
      <div className='sub-page-content' data-test-admin-organizations>
        <Switch>
          <Route exact path={listPathName} render={(routeProps) => (
            <List {...routeProps} />
          )} />
          <Route path={addOrganizationPathName} render={(routeProps) => (
            <AddOrganizationForm {...routeProps} />
          )} />
          <Route path={editOrganizationPathName} render={(routeProps) => (
            <EditOrganizationForm {...routeProps} />
          )} />
        </Switch>

      </div>
    );
  }
}

export default OrganizationRoute;