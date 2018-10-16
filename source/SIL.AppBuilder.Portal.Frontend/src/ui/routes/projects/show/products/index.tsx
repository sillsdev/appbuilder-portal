import * as React from 'react';
import { compose } from 'recompose';

import { ProjectResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import ProductModal from './modal';

import './styles.scss';

interface Params {
  project: ProjectResource;
}

type IProps =
  & Params
  & i18nProps;

class Products extends React.Component<IProps> {

  render() {

    const { t, project } = this.props;

    return (
      <div className='product'>
        <h3>{t('project.products.title')}</h3>
        <div className='empty-products flex align-items-center justify-content-center'>
          <span>{t('project.products.empty')}</span>
        </div>
        <ProductModal />
      </div>
    );

  }

}

export default compose(
  withTranslations
)(Products);