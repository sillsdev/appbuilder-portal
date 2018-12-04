import * as React from 'react';

import List from './list';
import AddWorkflowDefinitionForm from './new';
import EditWorkflowDefinitionForm from './edit';

import { Switch, Route } from 'react-router-dom';

export const listPathName = '/admin/settings/workflow-definitions';
export const addWorkflowDefinitionPathName = '/admin/settings/workflow-definitions/new';
export const editWorkflowDefinitionPathName = '/admin/settings/workflow-definitions/:workflowDefinitionId/edit';

class WorkflowDefinitionRoute extends React.Component {

  render() {
    return (
      <div className='sub-page-content' data-test-admin-workflow-definitions>
        <Switch>
          <Route exact path={listPathName} render={(routeProps) => (
            <List {...routeProps} />
          )} />
          <Route path={addWorkflowDefinitionPathName} render={(routeProps) => (
            <AddWorkflowDefinitionForm {...routeProps} />
          )} />
          <Route path={editWorkflowDefinitionPathName} render={(routeProps) => (
            <EditWorkflowDefinitionForm {...routeProps} />
          )} />
        </Switch>

      </div>
    );
  }
}

export default WorkflowDefinitionRoute;