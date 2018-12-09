import * as React from 'react';
import { compose } from 'recompose';

import { withTranslations, i18nProps } from '@lib/i18n';

import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as ITableActionsProps } from '../with-table-selection';

import { UpArrow, DownArrow } from './sort-arrows';
import ColumnSelector from './column-selector';
import { IProvidedProps, IColumn } from '../with-table-columns';
import { COLUMN_KEY } from '@ui/components/project-table';
import { Checkbox } from 'semantic-ui-react';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps
  & IProvidedProps
  & ITableActionsProps
  & ISortProps;

interface IColumnProps {
  key?: number;
  className: string;
  onClick?: () => void;
}


class Header extends React.Component<IProps> {

  buildHeaderTitles = () => {
    const { activeProjectColumns } = this.props;
    return activeProjectColumns.map((column, i) =>
      this.buildColumn(column, { key: i })
    );
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
      columnProps.className = 'flex-100 gray-text clickable p-relative p-l-md';
    }

    return (
      <Tag data-test-project-table-column { ...columnProps }>
        { isSorting && (
          isAscending ? <UpArrow /> : <DownArrow />
        ) }
        {t(column.i18nKey)}
      </Tag>
    );
  }

  toggleSelectAll = (e) => {
    e.preventDefault();
    const { toggleSelectAll } = this.props;
    toggleSelectAll();
  }

  render() {

    const { toggleSelectAll } = this.props;

    const nameColumn = this.buildColumn({
      i18nKey: 'projectTable.columns.project',
      sortable: true,
      propertyPath: 'name',
      id: COLUMN_KEY.PROJECT_NAME
    });

    return (
      <div className='flex header grid m-b-md'>
        <div className='flex align-items-center justify-content-space-evenly flex-grow-xs p-sm'>
          <Checkbox onClick={this.toggleSelectAll}/>
          { nameColumn }
          { this.buildHeaderTitles() }
          <div className='flex align-items-center p-r-md line-height-0'>
            <ColumnSelector {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(Header);
