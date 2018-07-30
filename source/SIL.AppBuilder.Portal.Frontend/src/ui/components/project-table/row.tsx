import * as React from 'react';

import { ProjectAttributes } from '@data/models/project';
import { Link } from 'react-router-dom';
import { Dropdown, Icon } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

export interface IProps {
  project: JSONAPI<ProjectAttributes>;
}

class Row extends React.Component<IProps & i18nProps> {

  render() {
    const { project: data, t } = this.props;
    const { attributes: project } = data;

    return (
      <tr>
        <td><Link to='project/some-project-id'>{project.name}</Link></td>
        <td className='bold'>{project.organization.name}</td>
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
              <Dropdown.Item text={t('project.dropdown.archive')} />
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    );
  }
}

export default compose(
  translate('translations'),
)(Row);
