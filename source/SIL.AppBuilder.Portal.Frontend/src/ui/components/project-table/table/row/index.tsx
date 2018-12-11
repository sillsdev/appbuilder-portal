import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import { Checkbox } from 'semantic-ui-react';

import {
  attributesFor,
  ProjectResource,
  OrganizationResource,
  GroupResource,
  UserResource,
  idFromRecordIdentity
} from '@data';


import RowActions from './row-actions';

import { IProvidedProps as ITableColumns } from '../with-table-columns';
import { IProvidedProps as ITableRows } from '../with-table-rows';
import { COLUMN_KEY } from '../column-data';

import Products from './products';

interface IOwnProps {
  project: ProjectResource;
  organization: OrganizationResource;
  owner: UserResource;
  group: GroupResource;
  toggleArchiveProject: (project: ProjectResource) => void;
  projectPath?: (id: string) => string;
}

type IProps =
  & IOwnProps
  & ITableColumns
  & ITableRows;

class Row extends React.Component<IProps> {

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

  onSelect = row => e => {
    e.preventDefault();
    const { toggleRowSelection } = this.props;
    toggleRowSelection(row);
  }

  inRowSelection = row => {
    const { selectedRows } = this.props;
    const p = selectedRows && selectedRows.find(r =>
      idFromRecordIdentity(r) === idFromRecordIdentity(row)
    );
    return p != undefined;
  }

  render() {
    const { project, projectPath } = this.props;
    const projectId = idFromRecordIdentity(project as any);
    const activeProjectColumns = this.getActiveProjectColumns();

    const { name: projectName, dateArchived } = attributesFor(project);

    const clickPath = projectPath ? projectPath(projectId) : `/projects/${projectId}`;

    return (
      <div
        data-test-project-row
        className='m-b-md with-shadow'
        style={{ opacity: dateArchived ? 0.5 : 1 }}
      >
        <div className='flex row-header align-items-center p-t-md p-b-md'>
          <div className='col flex align-items-center flex-grow-xs flex-100 p-l-sm'>
            <Checkbox
              className='m-r-sm'
              onClick={this.onSelect(project)}
              checked={this.inRowSelection(project)}
            />
            <Link to={clickPath}>{projectName}</Link>
          </div>

          { activeProjectColumns.map((column, i) => (
            <div key={i} data-test-project-table-column className='col flex-100'>
              {column.value}
            </div>
          ))}

          <div className='flex align-items-center p-r-md line-height-0'>
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
    // subscribes this component sub-tree to updates for the project
    // this is what enables the row to fade when a project is archived.
    project: q => q.findRecord(project),
    organization: q => q.findRelatedRecord(project, 'organization'),
    owner: q => q.findRelatedRecord(project, 'owner'),
    group: q => q.findRelatedRecord(project, 'group'),
    products: q => q.findRelatedRecords(project, 'products'),
  }))
)(Row);
