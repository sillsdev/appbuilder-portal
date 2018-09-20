import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown, Checkbox } from 'semantic-ui-react';

import { IProvidedProps } from './withTableColumns';
import { withTranslations, i18nProps } from '@lib/i18n';

class ColumnSelector extends React.Component<IProvidedProps & i18nProps> {

  onColumnClick = (column) => (e) => {
    e.stopPropagation();
    this.props.updateColumnSelection(column);
  }

  render() {

    const { t, columns, isInSelectedColumns } = this.props;

    return (
      <Dropdown
        data-test-project-table-columns-selector
        multiple
        className='columns-dropdown'
        direction='left'
      >
        <Dropdown.Menu className='columns'>
          {
            columns && columns.map((column, index) => (
              <React.Fragment key={index}>
                <div
                  className='item'
                  onClick={this.onColumnClick(column)}
                >
                  <Checkbox
                    data-test-project-table-columns-selector-item
                    value={column.id}
                    label={t(`projectTable.columns.${column.id}`)}
                    checked={isInSelectedColumns(column.id)}
                  />
                </div>
              </React.Fragment>
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    );

  }

}

export default compose(
  withTranslations
)(ColumnSelector);