import { compose } from 'recompose';

import Table from './table';
import { withData } from './data';

export default compose(
  withData
)(Table);
