import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './list';
import AddProductDefinitionForm from './new';
import EditProductDefinitionForm from './edit';

export const listPathName = '/admin/settings/product-definitions';
export const addProductDefinitionPathName = '/admin/settings/product-definitions/new';
export const editProductDefinitionPathName = '/admin/settings/product-definitions/:pdId/edit';

class ProductDefinitionRoute extends React.Component {
  render() {
    return (
      <div className='sub-page-content' data-test-admin-product-definitions>
        <Switch>
          <Route exact path={listPathName} component={List} />
          <Route path={addProductDefinitionPathName} component={AddProductDefinitionForm} />
          <Route path={editProductDefinitionPathName} component={EditProductDefinitionForm} />
        </Switch>
      </div>
    );
  }
}

export default ProductDefinitionRoute;
