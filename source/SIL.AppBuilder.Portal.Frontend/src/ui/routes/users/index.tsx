import * as React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { requireAuth } from '@lib/auth';
import { NotFound } from '@ui/routes/errors';
import { withLayout } from '@ui/components/layout';

import ListRoute, { pathName as listPath } from './list';
import ShowRoute, { pathName as showPath } from './show';
import EditRoute, { pathName as editPath } from './edit';

class UsersRoot extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={listPath} component={ListRoute} />
        <Route exact path={showPath} component={ShowRoute} />
        <Route path={editPath} component={EditRoute} />

        <Route component={NotFound} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth(),
  withLayout,
  withRouter
)(UsersRoot);
