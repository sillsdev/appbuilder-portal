import * as React from 'react';
import { Link } from 'react-router-dom';
import { ResourceObject } from 'jsonapi-typescript';
import { compose } from 'recompose';

import { attributesFor, PROJECTS_TYPE, ORGANIZATIONS_TYPE, USERS_TYPE, GROUPS_TYPE, idFromRecordIdentity } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';
import { UserAttributes } from '@data/models/user';
import { GroupAttributes } from '@data/models/group';

import { withRelationship } from './withRelationship';

import RowActions from '@ui/components/project-table/row-actions';

import { IProvidedProps } from './withTableColumns';
import Products from './products';
import Column from './column';

export interface IProps {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  owner: ResourceObject<USERS_TYPE, UserAttributes>;
  group: ResourceObject<GROUPS_TYPE, GroupAttributes>;
  toggleArchiveProject: (project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>) => void;
}

class Row extends React.Component<IProps & IProvidedProps> {

  render() {
    const { project, organization, owner, group, isInSelectedColumns, columnWidth } = this.props;

    const { name: projectName, language } = attributesFor(project);
    const { name: orgName, archivedAt } = attributesFor(organization);
    const { givenName, familyName } = attributesFor(owner);
    const { name: groupName } = attributesFor(group);

    const isArchived = archivedAt != null;
    const archiveStyle = { opacity: isArchived ? '1' : '0.5'};

    const projectId = idFromRecordIdentity(project as any);

    const ownerName = `${givenName} ${familyName}`;

    const columnStyle = {
      width: `${columnWidth()}%`
    };

    const productsProps = {
      isInSelectedColumns,
      columnWidth
    };

    return (
      <div>
        <div className='flex row-header grid'>
          <div className='col flex-grow-xs' style={columnStyle}>
            <Link to={`/project/${projectId}`}>{projectName}</Link>
          </div>
          <Column value={ownerName} display={isInSelectedColumns('owner')} style={columnStyle}/>
          <Column value={orgName} display={isInSelectedColumns('organization')} style={columnStyle}/>
          <Column value={language} display={isInSelectedColumns('language')} style={columnStyle}/>
          <Column value={groupName} display={isInSelectedColumns('group')} style={columnStyle}/>
          <div className='action'>
            <RowActions project={project} />
          </div>
        </div>
        <Products {...productsProps} />
      </div>
    );
  }
}

export default compose(
  withRelationship('organization'),
  withRelationship('owner'),
  withRelationship('group')
)(Row);
