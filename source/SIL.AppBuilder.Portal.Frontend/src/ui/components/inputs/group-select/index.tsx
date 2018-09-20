import { compose } from 'recompose';

import Display from './display';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withData } from './with-data';

export default compose(
  withCurrentUser(),
  withData
)(Display);

