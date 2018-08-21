import * as React from 'react';

import { Link } from 'react-router-dom';
import { Dropdown, Icon } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { withProjectOperations } from '@ui/routes/project/with-project-operations';

import { attributesFor } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { OrganizationAttributes } from '@data/models/organization';

import { withRelationship } from './withRelationship';

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
    const { name: orgName } = attributesFor(organization);

    return (
      <div className='flex row-header grid'>
        <div className='col'><Link to={`/project/${data.id}`}>{project.name}</Link></div>
        <div className='col'>{orgName}</div>
        <div className='col'>{project.language}</div>
        <div className='action'>
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
        </div>
      </div>
    );
  }
}

export default compose(
  translate('translations'),
  withRelationship('organization'),
  withProjectOperations
)(Row);
