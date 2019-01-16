import * as React from 'react';
import { PaginationFooter } from '@data/containers/api';
import { ISortProps } from '@data/containers/api/sorting';
import { IPaginateProps } from '@data/containers/api/pagination';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IOwnProps as IProjectProps } from '@data/containers/resources/project/list';
import { IColumnProps, IRowProps } from '@ui/components/project-table';
import ProjectTable from '@ui/components/project-table/table';

import Header from './header';

import '@ui/components/project-table/project-table.scss';

interface IOwnProps {
  tableName: string;
  rowCount: number;
}

export type IProps = IOwnProps &
  IPaginateProps &
  ISortProps &
  IColumnProps &
  IRowProps &
  IFilterProps &
  IProjectProps;

export default class Display extends React.Component<IProps> {
  search = (term: string) => {
    const { updateFilter, removeFilter } = this.props;

    if (!term) {
      return removeFilter({ attribute: 'name', value: '' });
    }

    updateFilter({ attribute: 'search-term', value: term });
  };

  afterBulkAction = () => {
    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      tableName,
      projects,
      toggleSort,
      isAscending,
      sortProperty,
      columns,
      selectedColumns,
      isLoading,
      toggleColumnSelection,
      activeProductColumns,
      activeProjectColumns,
      possibleColumns,
      selectedRows,
      toggleRowSelection,
      toggleAllRowSelection,
      rowCount,
      allCheckboxState,
    } = this.props;

    /* TODO: figure out how to disable certain pagination buttons */

    const tableProps = {
      projects,
      isLoading,
      toggleSort,
      isAscending,
      sortProperty,
      columns,
      selectedColumns,
      toggleColumnSelection,
      activeProductColumns,
      activeProjectColumns,
      possibleColumns,
      selectedRows,
      toggleRowSelection,
      toggleAllRowSelection,
      rowCount,
      allCheckboxState,
      showSelection: true,
    };

    const headerProps = {
      filter: tableName,
      onSearch: this.search,
      projects,
      selectedRows,
      activeProjectColumns,
      possibleColumns,
      onBulkActionComplete: this.afterBulkAction,
    };

    return (
      <div data-test-project-list>
        <Header {...headerProps} />
        <ProjectTable {...tableProps} />
        {
          <div className='flex-row justify-content-end'>
            <PaginationFooter className='m-t-lg' {...this.props} />
          </div>
        }
      </div>
    );
  }
}
