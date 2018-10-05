import * as React from 'react';
import { compose } from 'recompose';

import { TEMP_DEFAULT_PAGE_SIZE } from '@data';
import { PaginationFooter } from '@data/containers/api';
import { ISortProps } from '@data/containers/api/sorting';
import { IPaginateProps } from '@data/containers/api/pagination';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IOwnProps as IProjectProps } from '@data/containers/resources/project/list';
import { IColumnProps } from '@ui/components/project-table';

import ProjectTable from '@ui/components/project-table/table';

import Header from './header';

import '@ui/components/project-table/project-table.scss';

interface IOwnProps {
  tableName: string;
}

export type IProps =
& IOwnProps
& IPaginateProps
& ISortProps
& IColumnProps
& IFilterProps
& IProjectProps;


export default class Display extends React.Component<IProps> {
  search = (term: string) => {
    const { updateFilter } = this.props;

    updateFilter({ attribute: 'search-term', value: term });
  }

  render() {
    const {
      tableName, projects,
      toggleSort, isAscending, sortProperty,
      columns, selectedColumns,
      toggleColumnSelection, activeProductColumns, activeProjectColumns, possibleColumns
    } = this.props;

    const isPaginationNeeded = projects.length > TEMP_DEFAULT_PAGE_SIZE;

    const tableProps = {
      projects,
      toggleSort, isAscending, sortProperty,
      columns, selectedColumns,
      toggleColumnSelection, activeProductColumns, activeProjectColumns, possibleColumns
    };

    return (
      <>
        <Header filter={tableName} onSearch={this.search} />
        <ProjectTable { ...tableProps } />

        { isPaginationNeeded && (
          <div className='flex-row justify-content-end'>
            <PaginationFooter className='m-t-lg' { ...this.props } />
          </div>
        )}
      </>
    );
  }
}


