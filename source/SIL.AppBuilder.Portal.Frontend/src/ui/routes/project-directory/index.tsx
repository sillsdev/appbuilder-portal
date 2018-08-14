import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withData as withOrbit } from 'react-orbitjs';


import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';
import { GroupAttributes } from '@data/models/group';
import { withSorting } from '@data/containers/sorting';
import { withPagination } from '@data/containers/pagination';

import { query, defaultOptions } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as GROUP } from '@data/models/group';

import { requireAuth } from '@lib/auth';

import {
  Table,
  IDataProps, withData as withProjects
} from '@ui/components/project-table';

import { withFiltering, IProvidedProps as IFilterProps } from '@data/containers/with-filtering';
import { setCurrentOrganization } from '@store/data';

import { withLayout } from '@ui/components/layout';
import { ErrorMessage } from '@ui/components/errors';
import ProjectSearch from '@ui/components/project-search';

import '@ui/components/project-table/project-table.scss';

import Filters from './filters';

export const pathName = '/directory';

export interface IOwnProps {
  organizations: JSONAPI<OrganizationAttributes>;
  setCurrentOrganizationId: (id: number | string) => void;
  groups: JSONAPI<GroupAttributes>;
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
  withOrbit({
    organizations: q => q.findRecords(ORGANIZATION),
    groups: q => q.findRecords(GROUP)
  }),
  connect(null, mapDispatchToProps),
  withFiltering,
  withProjects
)(ProjectDirectoryRoute);
