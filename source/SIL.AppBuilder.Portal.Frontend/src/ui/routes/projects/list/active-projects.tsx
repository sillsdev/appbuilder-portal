import { compose, withProps } from 'recompose';
import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { withTableColumns, withTableRows, COLUMN_KEY } from '@ui/components/project-table';

import Display from './display';

import { withCurrentUserContext } from '~/data/containers/with-current-user';

export const pathName = '/projects/active';

export default compose(
  withCurrentUserContext,
  withCurrentOrganization,
  withSorting({ defaultSort: '-dateActive' }), // need dateActive (not date-active) for direction arrow
  withPagination(),
  withFiltering({
    requiredFilters: [{ attribute: 'date-active', value: 'isnotnull:' }],
  }),
  withNetwork(),
  withLoader(({ error, projects }) => !error && !projects),
  withProps(({ projects }) => ({
    tableName: 'active-projects',
    rowCount: projects ? projects.length : 0,
  })),
  withTableColumns({
    tableName: 'active-projects',
    defaultColumns: [
      COLUMN_KEY.PROJECT_OWNER,
      COLUMN_KEY.PROJECT_GROUP,
      COLUMN_KEY.PROJECT_LANGUAGE,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_BUILD_DATE,
      COLUMN_KEY.PROJECT_DATE_ACTIVE,
    ],
  }),
  withTableRows({
    tableName: 'active-projects',
  })
)(Display);
