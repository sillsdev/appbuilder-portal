import { compose } from 'recompose';

export { IOwnProps as IDataProps, withNetwork as withData } from '@data/containers/resources/project/list';
import Table from './table';
import { withFiltering } from '@data/containers/with-filtering';
import { withNetwork } from '@data/containers/resources/project/list';
import { withPagination } from '@data/containers/pagination';
import { withSorting } from '@data/containers/sorting';

import './project-table.scss';

export { default as Table } from './table';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering(),
  withNetwork,
)(Table);
