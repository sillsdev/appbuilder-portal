import * as React from 'react';
import { compose } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';

import { TYPE_NAME as PROJECT } from '@data/models/project';

import Table from '@ui/components/project-table/table';
import { withTableColumns, COLUMN_KEY } from '@ui/components/project-table';

import '@ui/components/project-table/project-table.scss';

export default compose(
  withTableColumns({
    tableName: 'my-projects',
    defaultColumns: [
      COLUMN_KEY.PROJECT_OWNER,
      COLUMN_KEY.PROJECT_GROUP,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON
    ]
  }),
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering({
    requiredFilters: [
      { attribute: 'date-archived', value: 'isnotnull:' }
    ]
  }),
  withNetwork(),
  withCache(({ applyFilter }) => ({
    projects: q => applyFilter(q.findRecords(PROJECT), true)
  })),
  withLoader(({ error, projects }) => !error && !projects),
)(Table);
