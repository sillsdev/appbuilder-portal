import * as React from 'react';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { ProjectAttributes } from '@data/models/project';
import { Checkbox } from 'semantic-ui-react';

interface Params {
  project: JSONAPI<ProjectAttributes>;
}

type IProps =
  & Params
  & i18nProps;


class Settings extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { automaticRebuild, allowOtherToDownload } = project.attributes;

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
              toggle
              defaultChecked={automaticRebuild}
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
              toggle
              defaultChecked={automaticRebuild}
            />
          </div>
        </div>
      </div>
    );

  }
}

export default compose(
  translate('translations')
)(Settings);