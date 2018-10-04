import * as React from 'react';
import { compose } from 'recompose';
import DownArrow from '@material-ui/icons/ArrowDownward';
import UpArrow from '@material-ui/icons/ArrowUpward';

import { withTranslations, i18nProps } from '@lib/i18n';

import { ISortProps, SortDirection } from '@data/containers/api/sorting';

import ColumnSelector from './column-selector';
import { IProvidedProps, IColumn } from '../with-table-columns';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps
  & IProvidedProps
  & ISortProps;

interface IColumnProps {
  key?: number;
  className: string;
  onClick?: () => void;
}

const iconStyle = {
  width: '14px',
  height: '14px',
  position: 'absolute',
  marginLeft: '-14px',
  marginTop: '2px'
};

class Header extends React.Component<IProps> {

  buildHeaderTitles = () => {
    const { activeProjectColumns } = this.props;

    return activeProjectColumns.map((column, i) => this.buildColumn(column, { key: i }));
  }

  buildColumn = (column: IColumn, additionalProps = {}) => {
    const { t, toggleSort, isAscending, sortProperty } = this.props;
    const isSortable = column.sortable && toggleSort;
    const isSortingByColumn = sortProperty && sortProperty.includes(column.propertyPath);
    const isSorting = isSortable && isSortingByColumn;
    let Tag = 'div';

    const columnProps: IColumnProps = {
      className: 'col flex-100',
      ...additionalProps
    };

    if (isSortable) {
      Tag = 'a';
      columnProps.onClick = () => toggleSort(column.propertyPath);
      columnProps.className = 'col flex-100 gray-text clickable';
    }

    return (
      <Tag data-test-project-table-column { ...columnProps }>
        { isSorting && (
          isAscending ? <UpArrow style={iconStyle} /> : <DownArrow style={iconStyle} />
        ) }
        {t(column.i18nKey)}
      </Tag>
    );
  }

  render() {

    const {
      t,
      activeProjectColumns
    } = this.props;

    const nameColumn = this.buildColumn({
      i18nKey: 'projectTable.columns.project',
      sortable: true,
      propertyPath: 'name',
      id: 'name'
    });

    return (
      <div className='flex header grid'>
        <div className='flex justify-content-space-evenly flex-grow-xs'>
          { nameColumn }
          { this.buildHeaderTitles() }

        </div>
        <div className='action'>
          <ColumnSelector {...this.props} />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(Header);
