import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withData as withCache } from 'react-orbitjs';


import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';
import { GroupAttributes } from '@data/models/group';
import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';

import { query, defaultOptions, ORGANIZATIONS_TYPE, GROUPS_TYPE } from '@data';
import { TYPE_NAME as PROJECT } from '@data/models/project';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';

import { requireAuth } from '@lib/auth';


import { withCurrentUser } from '@data/containers/with-current-user';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork as withProjects } from '@data/containers/resources/project/list';
import { withFiltering, IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { setCurrentOrganization } from '@store/data';

import { Table, IDataProps } from '@ui/components/project-table';
import { withLayout } from '@ui/components/layout';
import { ErrorMessage } from '@ui/components/errors';
import ProjectSearch from '@ui/components/project-search';

import '@ui/components/project-table/project-table.scss';

import Filters from './filters';
import { ResourceObject } from 'jsonapi-typescript';

export const pathName = '/directory';

export interface IOwnProps {
  organizations: Array<ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>>;
  setCurrentOrganizationId: (id: number | string) => void;
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
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
      projects, organizations, groups,
      updateFilter, error,
      setCurrentOrganizationId
    } = this.props;

    const numProjects = projects && projects.length;

    return (
      <div className='ui container'>
        <div className='flex-row justify-content-space-between align-items-center'>
          <h2 className='page-heading'>{t('directory.title', { numProjects })}</h2>

          <ProjectSearch updateFilter={updateFilter}
          />
        </div>

        <Filters
          organizations={organizations}
          onOrganizationChange={setCurrentOrganizationId}
          updateFilter={updateFilter} />

        { error && <ErrorMessage error={error} /> }
        { !error && <Table projects={projects} /> }
      </div>
    );
  }
}



export default compose (
  translate('translations'),
  requireAuth,
  withLayout,
  connect(null, mapDispatchToProps),
  withCurrentUser(),
  withFiltering(({ currentUser }) => ({
    requiredFilters: [
      { attribute: 'date-archived', value: 'isnull:' }
    ]
  })),
  withProjects,
  withLoader(({ error, projects }) => !error && !projects),
  withCache(({ applyFilter }) => ({
    organizations: q => q.findRecords(ORGANIZATION),
    groups: q => q.findRecords(GROUP),
    projects: q => {
      const result = applyFilter(q.findRecords(PROJECT), true);

      return result;
    }
  })),
)(ProjectDirectoryRoute);
