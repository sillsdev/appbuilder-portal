import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { ResourceObject } from 'jsonapi-typescript';

import { attributesFor, PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { withProjectOperations } from '@ui/routes/project/with-project-operations';
import { withTranslations, i18nProps } from '@lib/i18n';

export interface IProps {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  toggleArchiveProject: (project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>) => void;
}

class RowActions extends React.Component<IProps & i18nProps> {

  toggleArchivedProject = () => {
    const { project, toggleArchiveProject } = this.props;
    toggleArchiveProject(project);
  }

  render() {

    const { t, project } = this.props;
    const { dateArchived } = attributesFor(project);

    const dropdownItemText = !dateArchived ?
      t('project.dropdown.archive') :
      t('project.dropdown.reactivate');

    return (
      <Dropdown
        className='project-actions'
        pointing='top right'
        icon={null}
        trigger={
          <MoreVerticalIcon />
        }
      >
        <Dropdown.Menu>
          <Dropdown.Item text={t('project.dropdown.transfer')} />
          <Dropdown.Item
            text={dropdownItemText}
            onClick={this.toggleArchivedProject}
          />
        </Dropdown.Menu>
      </Dropdown>
    );

  }

}

export default compose(
  withTranslations,
  withProjectOperations
)(RowActions);