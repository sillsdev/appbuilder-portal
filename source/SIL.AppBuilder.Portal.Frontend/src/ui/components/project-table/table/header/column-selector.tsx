import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown, Checkbox } from 'semantic-ui-react';

import { IProvidedProps as IColumnProps } from '../with-table-columns';
import { possibleColumns, COLUMN_KEY } from '../column-data';
import { withTranslations, i18nProps } from '@lib/i18n';

const columns = Object.keys(possibleColumns);

class ColumnSelector extends React.Component<IColumnProps & i18nProps> {

  onColumnClick = (column) => (e) => {
    e.stopPropagation();

    this.props.toggleColumnSelection(column);
  }

  render() {

    const { t, selectedColumns } = this.props;


    return (
      <Dropdown
        data-test-project-table-columns-selector
        multiple
        className='columns-dropdown'
        direction='left'
      >
        <Dropdown.Menu className='columns'>
          {
            columns.map((column: COLUMN_KEY, index) => {
              const columnData = possibleColumns[column];

              return (
                <Checkbox
                  key={index}
                  className='w-100 item'
                  data-test-project-table-columns-selector-item
                  value={column}
                  label={t(columnData.i18nKey)}
                  checked={selectedColumns.includes(column)}
                  onClick={this.onColumnClick(column)}
                />
              );
            })
          }
        </Dropdown.Menu>
      </Dropdown>
    );

  }

}

export default compose(
  withTranslations
)(ColumnSelector);
