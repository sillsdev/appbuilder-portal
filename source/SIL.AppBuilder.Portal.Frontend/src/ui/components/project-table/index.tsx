import * as React from 'react';
import { compose } from 'recompose';

import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';
import { withFiltering } from '@data/containers/with-filtering';
export { IOwnProps as IDataProps, withNetwork as withData } from '@data/containers/resources/project/list';

import Table from './table';
import { withNetwork } from '@data/containers/resources/project/list';

import './project-table.scss';


export { default as Table } from './table';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering(),
  withNetwork,
)(Table);
