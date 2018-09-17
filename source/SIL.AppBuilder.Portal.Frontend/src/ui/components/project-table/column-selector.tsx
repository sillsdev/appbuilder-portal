import * as React from 'react';
import { Dropdown, Checkbox, Icon } from 'semantic-ui-react';
import { IProvidedProps } from './withTableColumns';
import { withTranslations, i18nProps } from '@lib/i18n';
import { compose } from 'recompose';

class ColumnSelector extends React.Component<IProvidedProps & i18nProps> {

  onColumnClick = (column) => (e) => {
    e.stopPropagation();
    this.props.updateColumnSelection(column);
  }

  render() {

    const { t, columns, isInSelectedColumns } = this.props;

    return (
      <Dropdown
        data-test-table-columns
        multiple
        className='columns-dropdown'
        icon={null}
        direction='left'
        trigger={
          <Icon name='dropdown' size='large' />
        }
      >
        <Dropdown.Menu className='columns' data-test-multi-group-menu>
          {
            columns && columns.map((column, index) => (
              <React.Fragment key={index}>
                <div
                  className='item'
                  onClick={this.onColumnClick(column)}
                >
                  <Checkbox
                    data-test-multi-group-checkbox
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