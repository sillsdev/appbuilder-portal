import * as React from 'react';
import { Dropdown, Checkbox } from 'semantic-ui-react';
import TriggerIcon from '@material-ui/icons/PlaylistAdd';
import { withTranslations, i18nProps } from '@lib/i18n';

import { IProvidedProps as IColumnProps } from '../with-table-columns';
import { possibleColumns, COLUMN_KEY } from '../column-data';

const columns = Object.keys(possibleColumns);

class ColumnSelector extends React.Component<IColumnProps & i18nProps> {
  onColumnClick = (column) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.toggleColumnSelection(column);
  };

  render() {
    const { t, selectedColumns } = this.props;

    return (
      <Dropdown
        data-test-project-table-columns-selector
        multiple
        className='columns-dropdown'
        direction={'left'}
        icon={<TriggerIcon style={{ transform: 'rotate(-90deg)' }} />}
      >
        <Dropdown.Menu className='columns'>
          {columns.map((column: COLUMN_KEY) => {
            const columnData = possibleColumns[column];

            return (
              <Checkbox
                key={column}
                className='w-100 item'
                data-test-project-table-columns-selector-item
                label={t(columnData.i18nKey)}
                checked={selectedColumns.includes(column)}
                onClick={this.onColumnClick(column)}
              />
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default withTranslations(ColumnSelector);
