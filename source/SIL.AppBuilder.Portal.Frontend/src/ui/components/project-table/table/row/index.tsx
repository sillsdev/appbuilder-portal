import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';

import {
  attributesFor,
  ProjectResource,
  OrganizationResource,
  GroupResource,
  UserResource,
  idFromRecordIdentity
} from '@data';


import RowActions from './row-actions';

import { IProvidedProps } from '../with-table-columns';
import { COLUMN_KEY } from '../column-data';

import Products from './products';

export interface IProps {
  project: ProjectResource;
  organization: OrganizationResource;
  owner: UserResource;
  group: GroupResource;
  toggleArchiveProject: (project: ProjectResource) => void;
}

class Row extends React.Component<IProps & IProvidedProps> {
  getActiveProjectColumns = () => {
    const { project, organization, owner, group, activeProjectColumns } = this.props;

    const { language } = attributesFor(project);
    const { name: orgName } = attributesFor(organization);
    const { givenName, familyName } = attributesFor(owner);
    const { name: groupName } = attributesFor(group);

    const ownerName = `${givenName} ${familyName}`;

    return activeProjectColumns.map((column) => {
      switch (column.id) {
        case COLUMN_KEY.PROJECT_OWNER:
          column.value = ownerName;
          break;
        case COLUMN_KEY.PROJECT_LANGUAGE:
          column.value = language;
          break;
        case COLUMN_KEY.PROJECT_GROUP:
          column.value = groupName;
          break;
        case COLUMN_KEY.PROJECT_ORGANIZATION:
          column.value = orgName;
          break;
        default:
          column.value = "active column not recognized";
      }

      return column;
    });
  }
  render() {
    const { project } = this.props;
    const projectId = idFromRecordIdentity(project as any);
    const activeProjectColumns = this.getActiveProjectColumns();

    const { name: projectName } = attributesFor(project);

    return (
      <div data-test-project-row className='m-b-md with-shadow'>
        <div className='flex row-header grid align-items-center p-l-md p-r-md'>
          <div className='col flex-grow-xs flex-100'>
            <Link to={`/projects/${projectId}`}>{projectName}</Link>
          </div>

          { activeProjectColumns.map((column, i) => (
            <div key={i} data-test-project-table-column className='col flex-100'>
              {column.value}
            </div>
          ))}

          <div className='action'>
            <RowActions project={project} />
          </div>
        </div>

        <Products { ...this.props } />
      </div>
    );
  }
}

export default compose(
  withOrbit(({ project }) => ({
    organization: q => q.findRelatedRecord(project, 'organization'),
    owner: q => q.findRelatedRecord(project, 'owner'),
    group: q => q.findRelatedRecord(project, 'group'),
    products: q => q.findRelatedRecords(project, 'products'),
  }))
)(Row);
