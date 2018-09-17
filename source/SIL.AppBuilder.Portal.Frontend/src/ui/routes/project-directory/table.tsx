import { compose } from 'recompose';

import Table from '@ui/components/project-table/table';
import { withTableColumns } from '@ui/components/project-table/withTableColumns';

export default compose(
  withTableColumns({
    tableName: 'directory',
    defaultColumns: [
      { id: 'organization', type: 'header' },
      { id: 'language', type: 'header' },
      { id: 'buildVersion', type: 'product' },
      { id: 'updatedOn', type: 'product' }
    ]
  })
)(Table);