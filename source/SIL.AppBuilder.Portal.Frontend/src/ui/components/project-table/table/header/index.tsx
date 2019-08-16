import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';
import { withTranslations, i18nProps } from '@lib/i18n';
import { ISortProps } from '@data/containers/api/sorting';

import { IProvidedProps as ITableRows } from '../with-table-rows';

import { UpArrow, DownArrow } from './sort-arrows';
import ColumnSelector from './column-selector';

import { IProvidedProps, IColumn } from '../with-table-columns';

import { COLUMN_KEY, ALL_CHECKBOX_STATE } from '@ui/components/project-table';

import { ProjectResource } from '@data';

interface IOwnProps {
  projects: ProjectResource[];
  showSelection?: boolean;
}

type IProps = IOwnProps & i18nProps & IProvidedProps & ITableRows & ISortProps;

interface IColumnProps {
  key?: number;
  className: string;
  onClick?: () => void;
}

class Header extends React.Component<IProps> {
  buildHeaderTitles = () => {
    const { activeProjectColumns } = this.props;
    return activeProjectColumns.map((column, i) => this.buildColumn(column, { key: i }));
  };

  buildColumn = (column: IColumn, additionalProps = {}) => {
    const { t, toggleSort, isAscending, sortProperty } = this.props;
    const isSortable = column.sortable && toggleSort;
    const isSortingByColumn = sortProperty && sortProperty.includes(column.propertyPath);
    const isSorting = isSortable && isSortingByColumn;
    let Tag = 'div';

    const columnProps: IColumnProps = {
      className: 'col flex-100',
      ...additionalProps,
    };

    if (isSortable) {
      Tag = 'a';
      columnProps.onClick = () => toggleSort(column.propertyPath);
      columnProps.className = 'flex-100 gray-text clickable p-relative p-l-md';
    }

    return (
      <Tag data-test-project-table-column {...columnProps}>
        {isSorting && (isAscending ? <UpArrow /> : <DownArrow />)}
        {isSorting ? (
          <span data-test-project-table-sort-column>{t(column.i18nKey)}</span>
        ) : (
          t(column.i18nKey)
        )}
      </Tag>
    );
  };

  toggleSelectAll = (e) => {
    e.preventDefault();
    const { toggleAllRowSelection, projects } = this.props;
    toggleAllRowSelection(projects);
  };

  render() {
    const {
      allCheckboxState,
      showSelection,
      columns,
      selectedColumns,
      toggleColumnSelection,
      activeProductColumns,
      activeProjectColumns,
      possibleColumns,
    } = this.props;

    const checked = allCheckboxState === ALL_CHECKBOX_STATE.ALL;
    const indeterminate = allCheckboxState === ALL_CHECKBOX_STATE.INDETERMINATE;

    const nameColumn = this.buildColumn({
      i18nKey: 'projectTable.columns.project',
      sortable: true,
      propertyPath: 'name',
      id: COLUMN_KEY.PROJECT_NAME,
    });

    return (
      <div className='flex header grid m-b-md'>
        <div className='flex align-items-center justify-content-space-evenly flex-grow-xs p-sm'>
          {showSelection && (
            <Checkbox
              onClick={this.toggleSelectAll}
              checked={checked}
              indeterminate={indeterminate}
            />
          )}

          {nameColumn}

          {this.buildHeaderTitles()}

          <div className='flex align-items-center p-r-md line-height-0'>
            <ColumnSelector
              {...{
                columns,
                selectedColumns,
                toggleColumnSelection,
                activeProjectColumns,
                activeProductColumns,
                possibleColumns,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslations(Header);
