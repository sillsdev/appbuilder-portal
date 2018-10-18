import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProjectResource, ProductResource, withLoader } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import ProductModal from './modal';
import ProductItem from './item';

import './styles.scss';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  project: ProjectResource;
  products: ProductResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { project } = passedProps;

  return {
    products: q => q.findRelatedRecords(project, 'products')
  };
};

class Products extends React.Component<IProps> {

  render() {

    const { t, products } = this.props;

    let productList;

    if (isEmpty(products)) {
      productList = (
        <div className='empty-products flex align-items-center justify-content-center'>
          <span>{t('project.products.empty')}</span>
        </div>
      );
    } else {
      productList = products.map((product, i) =>
        <ProductItem key={i} product={product} includeHeader={i === 0} />
      )
    }

    return (
      <div className='product'>
        <h3 className='m-b-md'>{t('project.products.title')}</h3>
        <div className='m-b-lg'>
          {productList}
        </div>
        <ProductModal />
      </div>
    );

  }

}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps),
  withLoader(({products}) => !products)
)(Products);