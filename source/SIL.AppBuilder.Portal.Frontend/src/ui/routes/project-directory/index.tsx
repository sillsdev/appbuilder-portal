import * as React from 'react';
import { compose } from 'recompose';
import { Switch, Route } from 'react-router-dom';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';
import { NotFound } from '@ui/routes/errors';

import IndexRoute from './list';
import ShowRoute, { pathName as showPath } from './show';

export const pathName = '/directory';

class DirectoryRoutes extends React.PureComponent {
  render() {
    return (
      <Switch>
        <Route exact path={pathName} component={IndexRoute} />
        <Route path={showPath} component={ShowRoute} />

        <Route component={NotFound} />
      </Switch>
    );
  }
}

export default compose(
  requireAuth,
  withLayout,
)(DirectoryRoutes);
