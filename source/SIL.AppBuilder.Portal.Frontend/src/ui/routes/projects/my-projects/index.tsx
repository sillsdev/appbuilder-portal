import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withCache } from 'react-orbitjs';

import { idFromRecordIdentity } from '@data';
import { PaginationFooter } from '@data/containers/api';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withSorting, ISortProps } from '@data/containers/api/sorting';
import { withPagination, IPaginateProps } from '@data/containers/api/pagination';
import { withFiltering } from '@data/containers/api/with-filtering';
import { withLoader } from '@data/containers/with-loader';
import { withNetwork, IOwnProps as IProjectProps } from '@data/containers/resources/project/list';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

import { TYPE_NAME as PROJECT } from '@data/models/project';

import ProjectTable from './table';
import Header from '../header';

export const pathName = '/projects/own';

export type IProps =
& IPaginateProps
& ISortProps
& IProjectProps;

class MyProjects extends React.Component<IProps> {
  render() {
    const { projects, toggleSort } = this.props;
    const isPaginationNeeded = projects.length > 19;
    const tableProps = {
      projects,
      toggleSort
    };

    return (
      <>
        <Header filter='own' />
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

export default compose(
  withCurrentUser(),
  withCurrentOrganization,
  withSorting({ defaultSort: 'name' }),
  withPagination(),
  withFiltering(({ currentUser }) => {
    const currentUserId = idFromRecordIdentity(currentUser);

    return {
      requiredFilters: [
        { attribute: 'date-archived', value: 'isnull:' },
        { attribute: 'owner-id', value: parseInt(currentUserId, 10) }
      ]
    };
  }),
  withNetwork(),
  withLoader(({ error, projects }) => !error && !projects),
  withProps(({ projects }) => ({
    projects: projects.filter(resource => resource.type === PROJECT)
  })),
)(MyProjects);
