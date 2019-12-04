import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './list';

export const listPathName = '/admin/settings/build-engines';

class BuildEngineRoute extends React.Component {
  render() {
    return (
      <div className='sub-page-content' data-test-admin-build-engines>
        <Switch>
          <Route exact path={listPathName} component={List} />
        </Switch>
      </div>
    );
  }
}

export default BuildEngineRoute;
