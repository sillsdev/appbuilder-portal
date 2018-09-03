import { compose } from 'recompose';

import { withData } from '../group-select/with-data';
import Display from './display';

export default compose(
  withData
)(Display);
