import * as React from 'react';
import { compose } from 'recompose';

import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';

import Table from './table';
import { withData } from './data';
import { withFiltering } from './with-filtering';

import './project-table.scss';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering,
  withData,
)(Table);
