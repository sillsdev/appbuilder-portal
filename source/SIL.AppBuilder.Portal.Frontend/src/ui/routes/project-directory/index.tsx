import * as React from 'react';
import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withData as withCache } from 'react-orbitjs';


import { OrganizationResource, GroupResource } from '@data';
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

import { requireAuth } from '@lib/auth';

import { setCurrentOrganization } from '@store/data';

import { IDataProps } from '@ui/components/project-table';

import { withLayout } from '@ui/components/layout';
import { ErrorMessage } from '@ui/components/errors';
import ProjectSearch from '@ui/components/project-search';

import '@ui/components/project-table/project-table.scss';

import Table from './table';
import Filters from './filters';
import { withSorting } from '@data/containers/api/sorting';
import { withTranslations } from '@lib/i18n';
import { withError } from '@data/containers/with-error';
import { withDebugger } from '@lib/debug';

export const pathName = '/directory';

export interface IOwnProps {
  organizations: OrganizationResource[];
  setCurrentOrganizationId: (id: number | string) => void;
  groups: GroupResource[];
}

export type IProps =
& IOwnProps
& IFilterProps
& IDataProps
& i18nProps;


const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id))
});

class ProjectDirectoryRoute extends React.Component<IProps> {
  render() {
    const {
      t,
      projects, updateFilter, error,
    } = this.props;

    const numProjects = projects && projects.length;

    // TODO: consider this for search instead of the existing
    //       https://github.com/smclab/react-faceted-token-input
    return (
      <div data-test-project-directory className='ui container'>
        <div className='flex-row justify-content-space-between align-items-center'>
          <h2 data-test-directory-header className='page-heading flex-50'>
            {t('directory.title', { numProjects })}
          </h2>

          <ProjectSearch updateFilter={updateFilter}
          />
        </div>

        <Filters { ...this.props } />

        { error && <ErrorMessage error={error} /> }
        { !error && (
          <>
            <Table projects={projects} />
            <PaginationFooter { ...this.props } />
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
