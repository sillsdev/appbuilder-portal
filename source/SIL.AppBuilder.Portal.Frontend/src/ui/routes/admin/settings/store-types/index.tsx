import * as React from 'react';

import List from './list';
// import AddStoreTypeForm from './new';
// import EditStoreTypeForm from './edit';

import { Switch, Route } from 'react-router-dom';

export const listPathName = '/admin/settings/store-types';
export const addStoreTypePathName = '/admin/settings/store-types/new';
export const editStoreTypePathName = '/admin/settings/store-types/:storeTypeId/edit';

class StoreTypeRoute extends React.Component {
  render() {
    return (
      <div className='sub-page-content' data-test-admin-store-types>
        <Switch>
          <Route exact path={listPathName} component={List} />
          {/* <Route path={addStoreTypePathName} component={AddStoreTypeForm} />
          <Route path={editStoreTypePathName} component={EditStoreTypeForm} /> */}
        </Switch>
      </div>
    );
  }
}

export default StoreTypeRoute;