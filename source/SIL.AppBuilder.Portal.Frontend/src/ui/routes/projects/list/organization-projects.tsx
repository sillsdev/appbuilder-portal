import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { TEMP_DEFAULT_PAGE_SIZE } from '@data';
import { PaginationFooter } from '@data/containers/api';
import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

import { withTableColumns, COLUMN_KEY } from '@ui/components/project-table';

import { TYPE_NAME as PROJECT } from '@data/models/project';

import Display from './display';

export const pathName = '/projects/organization';

export default compose(
  withCurrentOrganization,
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering({
    requiredFilters: [
      { attribute: 'date-archived', value: 'isnull:' }
    ]
  }),
  withNetwork(),
  withLoader(({ error, projects }) => !error && !projects),
  withProps(() => ({
    tableName: 'organization'
  })),
  withTableColumns({
    tableName: 'organization',
    defaultColumns: [
      COLUMN_KEY.PROJECT_OWNER,
      COLUMN_KEY.PROJECT_GROUP,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON
    ]
  }),
)(Display);
