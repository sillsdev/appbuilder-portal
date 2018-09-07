import * as React from 'react';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { ProjectAttributes } from '@data/models/project';
import { Checkbox } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';
import { withSettings } from './with-settings';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  toggleField: (projectId: Id, fieldName: string, newToggleState: boolean) => void;
}

type IProps =
  & Params
  & i18nProps;


class Settings extends React.Component<IProps> {

  toggle = (e, toggleData) => {

    const { project, toggleField } = this.props;

    const newToggleState = toggleData.checked;

    toggleField(project.id, toggleData.name, newToggleState);
  }

  render() {

    const { t, project } = this.props;
    const { automaticBuilds, allowDownloads } = project.attributes;

    return (
      <div className='settings'>
        <h3>{t('project.settings.title')}</h3>
        <div className='flex justify-content-space-around setting'>
          <div className='flex-grow'>
            <h4>{t('project.settings.automaticRebuild.title')}</h4>
            <p>{t('project.settings.automaticRebuild.description')}</p>
          </div>
          <div className='flex-shrink'>
            <Checkbox
              data-test-project-settings-automatic-build
              toggle
              name='automaticBuilds'
              defaultChecked={automaticBuilds}
              onChange={this.toggle}
            />
          </div>
        </div>
        <div className='flex justify-content-space-around setting no-border'>
          <div className='flex-grow'>
            <h4>{t('project.settings.organizationDownloads.title')}</h4>
            <p>{t('project.settings.organizationDownloads.description')}</p>
          </div>
          <div className='flex-shrink'>
            <Checkbox
              data-test-project-settings-allow-download
              toggle
              name='allowDownloads'
              defaultChecked={allowDownloads}
              onChange={this.toggle}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  translate('translations'),
  withSettings
)(Settings);