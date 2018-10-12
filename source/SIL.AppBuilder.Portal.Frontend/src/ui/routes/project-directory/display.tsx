import * as React from 'react';
import { Popup } from 'semantic-ui-react';

import { OrganizationResource, GroupResource, TEMP_DEFAULT_PAGE_SIZE } from '@data';

import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as IPaginateProps } from '@data/containers/api/with-filtering';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { i18nProps } from '@lib/i18n';
import { IDataProps, IColumnProps } from '@ui/components/project-table';

import { PaginationFooter } from '@data/containers/api/pagination-footer';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import { ErrorMessage } from '@ui/components/errors';
import Table from '@ui/components/project-table/table';

import Filters from './filters';

export interface IOwnProps {
  organizations: OrganizationResource[];
  setCurrentOrganizationId: (id: number | string) => void;
  groups: GroupResource[];
}

export type IProps =
& IOwnProps
& ISortProps
& IFilterProps
& IDataProps
& IPaginateProps
& IColumnProps
& i18nProps;


export default class DirectoryDisplay extends React.Component<IProps> {
  search = (value) => {
    const { updateFilter } = this.props;

    updateFilter({ attribute: 'search-term', value });
  }

  render() {
    const {
      t,
      projects, updateFilter, error, toggleSort,
      isAscending, sortProperty,
      columns, selectedColumns,
      toggleColumnSelection, activeProductColumns, activeProjectColumns, possibleColumns
    } = this.props;

    const numProjects = projects && projects.length;
    /* TODO: figure out how to disable certain pagination buttons */

    const tableProps = {
      projects,
      toggleSort, isAscending, sortProperty,
      columns, selectedColumns,
      toggleColumnSelection, activeProductColumns, activeProjectColumns, possibleColumns
    };

    return (
      <div data-test-project-directory className='ui container'>
        <div className='flex-row justify-content-space-between align-items-center'>
          <h2 data-test-directory-header className='page-heading flex-50'>
            {t('directory.title', { numProjects: 0 })}
          </h2>

          <Popup
            basic
            hoverable
            trigger={<div>
              <DebouncedSearch
                placeholder={t('common.search')}
                onSubmit={this.search} />
            </div>}
            position='bottom center'>

            <div dangerouslySetInnerHTML={{ __html: t('directory.search-help') }} />

          </Popup>
        </div>

        <Filters { ...this.props } />

        { error && <ErrorMessage error={error} /> }
        { !error && (
          <>
            <Table { ...tableProps } />

            {(
              <div className='flex-row justify-content-end'>
                <PaginationFooter className='m-t-lg' { ...this.props } />
              </div>
            )}
          </>
        ) }
      </div>
    );
  }
}
