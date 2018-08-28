import * as React from 'react';
import { compose } from 'recompose';

import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';

import Table from '@ui/components/project-table/table';
import { withData } from '@ui/components/project-table/data';
import { withFiltering } from '@data/containers/with-filtering';

import '@ui/components/project-table/project-table.scss';

export default compose(
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering({
    /* requiredFilters: [ */
    /*   { attribute: 'date-archived', value: 'eq:' } */
    /* ] */
  }),
  withData,
)(Table);
