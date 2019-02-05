import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import PrivateIcon from '@material-ui/icons/VisibilityOff';
import { Link } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';
import { Checkbox } from 'semantic-ui-react';

import {
  attributesFor,
  ProjectResource,
  OrganizationResource,
  GroupResource,
  UserResource,
  idFromRecordIdentity,
} from '@data';

import { withMomentTimezone, IProvidedProps as TimeProps } from '@lib/with-moment-timezone';

import { IProvidedProps as ITableColumns } from '../with-table-columns';
import { IProvidedProps as ITableRows } from '../with-table-rows';
import { COLUMN_KEY } from '../column-data';

import RowActions from './row-actions';
import Products from './products';

interface IOwnProps {
  project: ProjectResource;
  organization: OrganizationResource;
  owner: UserResource;
  group: GroupResource;
  toggleArchiveProject: (project: ProjectResource) => void;
  projectPath?: (id: string) => string;
  showSelection?: boolean;
  showProjectActions: boolean;
}

type IProps = IOwnProps & ITableColumns & ITableRows & RouteComponentProps & TimeProps;

class Row extends React.Component<IProps> {
  getActiveProjectColumns = () => {
    const {
      project,
      organization,
      owner,
      group,
      activeProjectColumns,
      moment,
      timezone,
    } = this.props;

    const { language, dateUpdated } = attributesFor(project);
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
        case COLUMN_KEY.PROJECT_DATE_UPDATED:
          column.value = moment(dateUpdated)
            .tz(timezone)
            .format('LLL');
          break;
        default:
          column.value = 'active column not recognized';
      }

      return column;
    });
  };

  onSelect = (row) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { toggleRowSelection } = this.props;

    toggleRowSelection(row);
  };

  inRowSelection = (row) => {
    const { selectedRows } = this.props;
    const p =
      selectedRows &&
      selectedRows.find((r) => idFromRecordIdentity(r) === idFromRecordIdentity(row));

    return p !== undefined;
  };

  get hasDimmStyle() {
    const { project, location } = this.props;
    const { dateArchived } = attributesFor(project);

    const isInArchiveLocation = location.pathname.match(/\/projects\/archived/);

    if (!isInArchiveLocation) {
      return dateArchived !== null;
    }

    return dateArchived === null;
  }

  render() {
    const { project, projectPath, showSelection, showProjectActions } = this.props;
    const projectId = idFromRecordIdentity(project as any);
    const activeProjectColumns = this.getActiveProjectColumns();

    const { name: projectName, isPublic } = attributesFor(project);

    const clickPath = projectPath ? projectPath(projectId) : `/projects/${projectId}`;
    const isPrivate = !isPublic;

    return (
      <div
        data-test-project-row={projectId}
        className={`m-b-md with-shadow ${isPrivate ? 'is-private has-tooltip' : ''}`}
        style={{ opacity: this.hasDimmStyle ? 0.5 : 1 }}
      >
        <div className='flex row-header align-items-center p-t-md p-b-md'>
          <div className='col flex align-items-center flex-grow-xs flex-100 p-l-sm'>
            {showSelection && (
              <Checkbox
                data-test-selector
                className='m-r-sm'
                onClick={this.onSelect(project)}
                checked={this.inRowSelection(project)}
              />
            )}
            <Link to={clickPath}>{projectName}</Link>
          </div>

          {activeProjectColumns.map((column) => (
            <div key={column.id} data-test-project-table-column className='col flex-100'>
              {column.value}
            </div>
          ))}

          <div className='flex align-items-center p-r-md line-height-0'>
            {isPrivate && <PrivateIcon />}
            {showProjectActions && <RowActions project={project} />}
          </div>
        </div>

        <Products {...this.props} />
      </div>
    );
  }
}

export default compose(
  withRouter,
  withMomentTimezone,
  withOrbit(({ project }) => ({
    // refetching the project (from local cache)
    // subscribes this component to changes to the project.
    project: (q) => q.findRecord(project),
    organization: (q) => q.findRelatedRecord(project, 'organization'),
    owner: (q) => q.findRelatedRecord(project, 'owner'),
    group: (q) => q.findRelatedRecord(project, 'group'),
    products: (q) => q.findRelatedRecords(project, 'products'),
  }))
)(Row);
