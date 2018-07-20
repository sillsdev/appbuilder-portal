import * as React from 'react';
import { compose } from 'recompose';

//import { withSorting } from '@data/containers/sorting';
//import { withPagination } from '@data/containers/pagination';
//import { withFiltering } from './with-filtering';

import Table from './table';
import { withData } from './data';

  export default compose(
//    withSorting({ defaultSort: 'name' }),
//    withPagination,
//    withFiltering,
    withData
  )(Table);