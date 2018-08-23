import * as React from 'react';
import { compose } from 'recompose';

import { Dropdown, Icon } from 'semantic-ui-react';
import { withTranslations, i18nProps } from '@lib/i18n';

import { attributesFor } from '@data';
import { ProjectAttributes } from '@data/models/project';

import { withProjectOperations } from '@ui/routes/project/with-project-operations';

export interface IProps {
  project: JSONAPI<ProjectAttributes>;
  toggleArchiveProject: (project: JSONAPI<ProjectAttributes>) => void;
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
          <Icon name='ellipsis vertical' size='large' />
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