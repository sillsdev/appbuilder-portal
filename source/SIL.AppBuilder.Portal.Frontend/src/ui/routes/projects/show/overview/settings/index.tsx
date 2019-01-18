import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox } from 'semantic-ui-react';

import { attributesFor, ProjectResource } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';

import { withSettings } from './with-settings';

interface INeededProps {
  project: ProjectResource;
}
interface ISettingsProps {
  toggleField: (fieldName: string, newToggleState: boolean) => void;
}

type IProps = INeededProps & ISettingsProps & i18nProps;

class Settings extends React.Component<IProps> {
  toggle = (e, toggleData) => {
    const { toggleField } = this.props;

    const newToggleState = toggleData.checked;

    toggleField(toggleData.name, newToggleState);
  };

  render() {
    const { t, project } = this.props;
    const { automaticBuilds, allowDownloads, isPublic } = attributesFor(project);

    return (
      <div className='settings'>
        <h3 className='fs-21'>{t('project.settings.title')}</h3>
        <div className='flex justify-content-space-around thin-bottom-border m-b-lg p-b-lg'>
          <div className='flex-grow'>
            <h4 className='fs-16 m-b-sm'>{t('project.settings.automaticRebuild.title')}</h4>
            <p className='fs-13'>{t('project.settings.automaticRebuild.description')}</p>
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
        <div className='flex justify-content-space-around thin-bottom-border m-b-lg p-b-lg'>
          <div className='flex-grow'>
            <h4 className='fs-16 m-b-sm'>{t('project.settings.organizationDownloads.title')}</h4>
            <p className='fs-13'>{t('project.settings.organizationDownloads.description')}</p>
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
        <div className='flex justify-content-space-around border-none'>
          <div className='flex-grow'>
            <h4 className='fs-16 m-b-sm'>{t('project.settings.visibility.title')}</h4>
            <p className='fs-13'>{t('project.settings.visibility.description')}</p>
          </div>
          <div className='flex-shrink'>
            <Checkbox
              data-test-project-settings-project-visibility
              toggle
              name='isPublic'
              defaultChecked={isPublic}
              onChange={this.toggle}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withSettings
)(Settings);
