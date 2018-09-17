import * as React from 'react';
import { compose } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';
import { withFiltering } from '@data/containers/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';

import { TYPE_NAME as PROJECT } from '@data/models/project';

import Table from '@ui/components/project-table/table';
import { withTableColumns } from '@ui/components/project-table/withTableColumns';

import '@ui/components/project-table/project-table.scss';

export default compose(
  withTableColumns({
    tableName: 'organization',
    defaultColumns: [
      { id: 'owner', type: 'header' },
      { id: 'group', type: 'header' },
      { id: 'buildVersion', type: 'product' },
      { id: 'updatedOn', type: 'product' }
    ]
  }),
  withSorting({ defaultSort: 'name' }),
  withPagination,
  withFiltering({
    requiredFilters: [
      { attribute: 'date-archived', value: 'isnull:' }
    ]
  }),
  withNetwork,
  withLoader(({ error, projects }) => !error && !projects),
  withCache(({ applyFilter }) => ({
    projects: q => applyFilter(q.findRecords(PROJECT), true)
  })),
)(Table);
