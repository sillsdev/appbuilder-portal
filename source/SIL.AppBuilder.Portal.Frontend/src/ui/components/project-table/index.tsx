import { compose } from 'recompose';

import Table from './table';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withNetwork } from '@data/containers/resources/project/list';
import { withPagination } from '@data/containers/api/pagination';
import { withSorting } from '@data/containers/api/sorting';

import './project-table.scss';

export { default as Table } from './table';
export { IProvidedProps as IColumnProps, withTableColumns } from './table/with-table-columns';
export { possibleColumns, COLUMN_KEY, possibleColumnsByType } from './table/column-data';
export { IOwnProps as IDataProps, withNetwork as withData } from '@data/containers/resources/project/list';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering(),
  withNetwork(),
)(Table);
