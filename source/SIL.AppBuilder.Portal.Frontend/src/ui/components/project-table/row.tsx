import * as React from 'react';

import { ProjectAttributes } from '@data/models/project';
import { Link } from 'react-router-dom';
import { Dropdown, Icon } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { withRelationship } from './withRelationship';
import { withProjectOperations } from '@ui/routes/project/with-project-operations';
import { OrganizationAttributes } from '@data/models/organization';

export interface IProps {
  project: JSONAPI<ProjectAttributes>;
  organization: JSONAPI<OrganizationAttributes>;
  toggleArchiveProject: (project: JSONAPI<ProjectAttributes>) => void;
}

class Row extends React.Component<IProps & i18nProps> {

  toggleArchivedProject = (e) => {
    e.preventDefault();
    const { project, toggleArchiveProject } = this.props;
    toggleArchiveProject(project);
  }

  render() {
    const { project: data, organization, t } = this.props;
    const { attributes: project } = data;
    // the organization _shouldn't_ be missing attributes
    // but it certainly can, when fake prorject data is used elsewhere.
    const { name: orgName } = ( organization || {} ).attributes || {};

    return (
      <tr>
        <td><Link to={`/project/${data.id}`}>{project.name}</Link></td>
        <td className='bold'>{orgName}</td>
        <td>{project.language}</td>
        <td>{project.status}</td>
        <td>{project.lastUpdatedAt}</td>
        <td>
          <Dropdown
            className='project-actions'
            pointing='top right'
            icon={null}
            trigger={
              <Icon name='ellipsis vertical' size='large' />
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item text={t('project.dropdown.transfer')} />
              <Dropdown.Item
                text={!project.dateArchived ? t('project.dropdown.archive') : t('project.dropdown.reactivate')}
                onClick={this.toggleArchivedProject}
              />
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    );
  }
}

export default compose(
  translate('translations'),
  withRelationship('organization'),
  withProjectOperations
)(Row);
