import * as React from 'react';
import { compose } from 'recompose';
import { Redirect } from 'react-router-dom';
import { withLayout } from '@ui/components/layout';
import { requireAuth } from '@lib/auth';

export const pathName = '/';

class IndexRoute extends React.Component {
  render() {
    return <Redirect push={true} to={'/tasks'} />;
  }
}

export default compose (
  requireAuth(),
  withLayout
)(IndexRoute);
