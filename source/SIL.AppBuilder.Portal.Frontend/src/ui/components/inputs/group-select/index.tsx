import * as React from 'react';
import { compose } from 'recompose';

import Display from './display';
import { withData } from './with-data';

export default compose(
  withData
)(Display);
