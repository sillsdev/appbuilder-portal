import * as React from 'react';

import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { ProjectAttributes } from '@data/models/project';

interface Params {
  project: JSONAPI<ProjectAttributes>;
}

type IProps =
  & Params
  & i18nProps;

class Details extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { language, type, description } = project.attributes;

    return (
      <div className='details'>
        <h3>{t('project.details.title')}</h3>
        <div className='flex justify-content-space-around'>
          <div className='flex-grow'>
            <h4>{t('project.details.language')}</h4>
            <p style={{marginRight: '39px'}}>{language}</p>
          </div>
          <div className='flex-grow'>
            <h4>{t('project.details.type')}</h4>
            <p>{type}</p>
          </div>
        </div>
        <div className='description'>{description}</div>
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Details);