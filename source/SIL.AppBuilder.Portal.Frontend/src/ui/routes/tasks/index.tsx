import * as React from 'react';
import { compose } from 'recompose';

import { requireAuth } from '@lib/auth';
import { withLayout } from '@ui/components/layout';

export const pathName = '/tasks';

class Tasks extends React.Component {

  state = { data: {}, errors: {} };

  render() {
    return 'hi';
  }
}

export default compose(
  withLayout,
  requireAuth
)(Tasks);
