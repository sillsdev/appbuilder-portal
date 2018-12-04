import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { idFromRecordIdentity, TEMP_DEFAULT_PAGE_SIZE } from '@data';
import { PaginationFooter } from '@data/containers/api';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

import { TYPE_NAME as PROJECT } from '@data/models/project';

import { withTableColumns, COLUMN_KEY } from '@ui/components/project-table';

import Display from './display';

export const pathName = '/projects/own';

export default compose(
  withCurrentUser(),
  withCurrentOrganization,
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering(({ currentUser }) => {
    const currentUserId = idFromRecordIdentity(currentUser);

    return {
      requiredFilters: [
        { attribute: 'date-archived', value: 'isnull:' },
        { attribute: 'owner-id', value: parseInt(currentUserId, 10) }
      ]
    };
  }),
  withNetwork(),
  withCache(() => ({
    projects : q => q.findRecords(PROJECT)
  })),
  withLoader(({ error, projects }) => !error && !projects),
  withProps(({ projects }) => ({
    projects: projects.filter(resource => resource.type === PROJECT && resource.attributes.dateArchived == null),
    tableName: 'my-projects'
  })),
  withTableColumns({
    tableName: 'my-projects',
    defaultColumns: [
      COLUMN_KEY.PROJECT_OWNER,
      COLUMN_KEY.PROJECT_GROUP,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON
    ]
  }),
)(Display);
