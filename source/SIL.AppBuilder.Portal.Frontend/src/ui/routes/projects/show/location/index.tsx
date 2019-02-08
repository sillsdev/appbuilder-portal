import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';

import { PROJECTS_TYPE } from '@data';

import { withTranslations } from '~/lib/i18n';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

type IProps = Params & i18nProps;

class Location extends React.Component<IProps> {
  render() {
    const { t, project } = this.props;
    const { location } = project.attributes;

    return (
      <div className='location'>
        <h3>{t('project.side.repositoryLocation')}</h3>
        <div className='ui input w-100'>
          <input type='text' readOnly value={location} />
        </div>
      </div>
    );
  }
}

export default compose(withTranslations)(Location);
