import * as React from 'react';
import { compose } from 'recompose';

import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';
import { withFiltering } from '@data/containers/with-filtering';

import Table from './table';
import { withData } from './data';

import './project-table.scss';


export { IOwnProps as IDataProps, withData } from './data';
export { default as Table } from './table';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering,
  withData,
)(Table);
