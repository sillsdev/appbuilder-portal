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


class Location extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { location } = project.attributes;

    return (
      <div>
        <h3>{t('project.side.repositoryLocation')}</h3>
        <input className='ui input w-100' type='text' readOnly value={location} />
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Location);