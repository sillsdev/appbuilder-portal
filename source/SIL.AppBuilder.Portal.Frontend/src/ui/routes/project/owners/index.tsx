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


class Owners extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { language, type } = project.attributes;

    return (
      <div>
        <div>
          <h4>{t('project.side.organization')}</h4>
          <div>
            <span>SIL International</span>
          </div>
        </div>
        <div>
          <h4>{t('project.side.projectOwner')}</h4>
          <div className='flex justify-content-space-around'>
            <div>
              <a href='#'>Andrew Nichols</a>
            </div>
            <div>
              <a href='#'>{t('common.change')}</a>
            </div>
          </div>
        </div>
        <div>
          <h4>{t('project.side.projectGroup')}</h4>
          <div>Central Asia</div>
        </div>
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Owners);