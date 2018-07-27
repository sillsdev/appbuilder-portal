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


class Reviewers extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { language, type } = project.attributes;

    return (
      <div>
        <div className='flex justify-content-space-around'>
          <h4>{t('project.side.reviewers.title')}</h4>
          <a href='#'>{t('project.side.reviewers.add')}</a>
        </div>
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Reviewers);