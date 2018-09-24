import { compose } from 'recompose';

import Table from '@ui/components/project-table/table';
import { withTableColumns, COLUMN_KEY } from '@ui/components/project-table';

export default compose(
  withTableColumns({
    tableName: 'directory',
    defaultColumns: [
      COLUMN_KEY.PROJECT_ORGANIZATION,
      COLUMN_KEY.PROJECT_LANGUAGE,
      COLUMN_KEY.PRODUCT_BUILD_VERSION,
      COLUMN_KEY.PRODUCT_UPDATED_ON
    ]
  })
)(Table);