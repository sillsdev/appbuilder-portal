import * as React from 'react';
import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { withData as withCache } from 'react-orbitjs';


import { OrganizationResource, GroupResource, TEMP_DEFAULT_PAGE_SIZE } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';
import { TYPE_NAME as PROJECT } from '@data/models/project';

import { withCurrentUser } from '@data/containers/with-current-user';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork as withProjects } from '@data/containers/resources/project/list';
import {
  withPagination, withFiltering,
  PaginationFooter,
  IFilterProps
} from '@data/containers/api';
import { IProvidedProps as IPaginateProps } from '@data/containers/api/with-filtering';
import { withSorting, ISortProps } from '@data/containers/api/sorting';
import { withError } from '@data/containers/with-error';

import { withTranslations, i18nProps } from '@lib/i18n';
import { requireAuth } from '@lib/auth';
import { tokensToObject } from '@lib/string/utils';

import { setCurrentOrganization } from '@store/data';

import { IDataProps } from '@ui/components/project-table';

import { withLayout } from '@ui/components/layout';
import { ErrorMessage } from '@ui/components/errors';
import ProjectSearch from '@ui/components/project-search';

import '@ui/components/project-table/project-table.scss';

import Table from './table';
import Filters from './filters';


export const pathName = '/directory';

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
& i18nProps;


const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id))
});

class ProjectDirectoryRoute extends React.Component<IProps> {
  search = (searchData) => {
    const { updateFilter } = this.props;

    const tokens = tokensToObject(searchData);

    Object.keys(tokens).forEach(token => {
      const value = tokens[token];

      updateFilter({ attribute: token, value: `like:${value}` });
    });
  }

  render() {
    const {
      t,
      projects, updateFilter, error, toggleSort
    } = this.props;

    const numProjects = projects && projects.length;
    const isPaginationNeeded = numProjects > TEMP_DEFAULT_PAGE_SIZE;

    const tableProps = {
      projects,
      toggleSort
    };

    return (
      <div data-test-project-directory className='ui container'>
        <div className='flex-row justify-content-space-between align-items-center'>
          <h2 data-test-directory-header className='page-heading flex-50'>
            {t('directory.title', { numProjects })}
          </h2>

          <ProjectSearch onSubmit={this.search}
          />
        </div>

        <Filters { ...this.props } />

        { error && <ErrorMessage error={error} /> }
        { !error && (
          <>
            <Table { ...tableProps } />

            { isPaginationNeeded && (
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

export default compose (
  withTranslations,
  requireAuth,
  withLayout,
  connect(null, mapDispatchToProps),
  withCurrentUser(),
  withFiltering(() => ({
    requiredFilters: [
      { attribute: 'date-archived', value: 'isnull:' }
    ]
  })),
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withProjects({ all: true }),
  withLoader(({ error, projects }) => !error && !projects),
  withError('error', ({ error }) => error !== undefined),
  withProps(({ projects }) => ({
    projects: projects.filter(resource => resource.type === PROJECT)
  })),
  withCache(() => ({
    organizations: q => q.findRecords(ORGANIZATION),
    groups: q => q.findRecords(GROUP),
  })),
)(ProjectDirectoryRoute);
