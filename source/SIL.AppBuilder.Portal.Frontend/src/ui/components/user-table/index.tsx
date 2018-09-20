import { compose } from 'recompose';

// import { withSorting } from '@data/containers/sorting';
// import { withPagination } from '@data/containers/pagination';
// import { withFiltering } from './with-filtering';

import Table from './table';
import { withData } from './data';

export default compose(
  withData
)(Table);