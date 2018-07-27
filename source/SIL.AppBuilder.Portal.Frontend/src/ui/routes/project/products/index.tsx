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

class Products extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;
    const { language, type } = project.attributes;

    return (
      <div className='product'>
        <h3>{t('project.products.title')}</h3>
        <div className='empty-products flex align-items-center justify-content-center'>
          <span>{t('project.products.empty')}</span>
        </div>
        <button className='ui button'>{t('project.products.add')}</button>
      </div>
    );

  }

}

export default compose(
  translate('translations')
)(Products);