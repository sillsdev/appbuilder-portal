import { compose, withProps } from 'recompose';

import { idFromRecordIdentity } from '@data';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withSorting } from '@data/containers/api/sorting';
import { withPagination } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork } from '@data/containers/resources/project/list';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

import { withTableColumns, withTableRows, COLUMN_KEY } from '@ui/components/project-table';

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
  withLoader(({ error, projects }) => !error && !projects),
  withProps(({projects}) => ({
    tableName: 'my-projects',
    rowCount: projects.length
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
  withTableRows({
    tableName: 'my-projects'
  })
)(Display);
