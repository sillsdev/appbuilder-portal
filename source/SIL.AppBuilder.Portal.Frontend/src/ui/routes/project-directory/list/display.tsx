import * as React from 'react';
import { Popup } from 'semantic-ui-react';
import { OrganizationResource, GroupResource } from '@data';
import { ISortProps } from '@data/containers/api/sorting';
import { IPaginateProps } from '@data/containers/api/pagination';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { i18nProps, useTranslations } from '@lib/i18n';
import { IDataProps, IColumnProps } from '@ui/components/project-table';
import { PaginationFooter } from '@data/containers/api/pagination-footer';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import Table from '@ui/components/project-table/table';

import Filters from './filters';

export interface IOwnProps {
  organizations: OrganizationResource[];
  setCurrentOrganizationId: (id: number | string) => void;
  groups: GroupResource[];
}

export type IProps = IOwnProps &
  ISortProps &
  IFilterProps &
  IDataProps &
  IPaginateProps &
  IColumnProps &
  i18nProps;

export default function DirectoryDisplay(props: IProps) {
  const {
    projects,
    updateFilter,
    removeFilter,
    currentPageOffset,
    setOffset,
    error,
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
  } = props;
  const { t } = useTranslations();

  const search = (value) => {
    if (!value) {
      return removeFilter({ attribute: 'search-term', value: '' });
    }

    updateFilter({ attribute: 'search-term', value });
  };

  /* TODO: figure out how to disable certain pagination buttons */

  return (
    <div data-test-project-directory className='ui container'>
      <div className='flex-row justify-content-space-between align-items-center'>
        <h2 data-test-directory-header className='page-heading flex-50'>
          {t('directory.title', { numProjects: 0 })}
        </h2>

        <Popup
          basic
          hoverable
          trigger={
            <div>
              <DebouncedSearch placeholder={t('common.search')} onSubmit={search} />
            </div>
          }
          position='bottom center'
        >
          <div dangerouslySetInnerHTML={{ __html: t('directory.search-help') }} />
        </Popup>
      </div>

      <Filters {...props} />

      {/* {error && <ErrorMessage error={error} />} */}
      {!error && (
        <>
          <Table
            {...{
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
              projectPath: (id) => `/directory/${id}`,
              showProjectActions: false,
            }}
          />

          {
            <div className='flex-row justify-content-end'>
              <PaginationFooter
                className='m-t-lg'
                {...{
                  currentPageOffset,
                  setOffset,
                }}
              />
            </div>
          }
        </>
      )}
    </div>
  );
}
