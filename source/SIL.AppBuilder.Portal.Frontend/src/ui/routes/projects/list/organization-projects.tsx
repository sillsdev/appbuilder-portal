import { compose, withProps } from 'recompose';
import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';

import { withCurrentUserContext } from '~/data/containers/with-current-user';

import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { withTableColumns, withTableRows, COLUMN_KEY } from '@ui/components/project-table';
import { TYPE_NAME as PROJECT } from '@data/models/project';

import Display from './display';

export const pathName = '/projects/organization';

export default compose(
  withCurrentUserContext,
  withCurrentOrganization,
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering({
    requiredFilters: [{ attribute: 'date-archived', value: 'isnull:' }],
  }),
  withNetwork(),
  withLoader(({ error, projects }) => !error && !projects),
  withProps(({ projects }) => ({
    tableName: 'organization',
    rowCount: projects ? projects.length : 0,
  })),
  withTableColumns({
    tableName: 'organization',
    defaultColumns: [
      COLUMN_KEY.PROJECT_OWNER,
      COLUMN_KEY.PROJECT_GROUP,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON,
    ],
  }),
  withTableRows({
    tableName: 'organization',
  })
)(Display);
