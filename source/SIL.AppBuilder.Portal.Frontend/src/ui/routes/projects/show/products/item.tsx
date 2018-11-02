import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import {
  ProductResource,
  ProductDefinitionResource,
  withLoader,
  attributesFor
} from '@data';

import ItemActions from './item-actions';
import ProductIcon from '@ui/components/product-icon';
import TimezoneLabel from '@ui/components/labels/timezone';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  includeHeader?: boolean;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
}

type IProps =
  & IOwnProps
  & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { product } = passedProps;
  return {
    productDefinition: q => q.findRelatedRecord(product, 'productDefinition')
  };
};

class ProductItem extends React.Component<IProps> {

  render() {

    const { product, productDefinition, t, includeHeader } = this.props;
    const { description } = attributesFor(productDefinition);
    const { dateUpdated, datePublished } = attributesFor(product);

    return (
      <div
        className='col flex w-100-xs-only
        flex-100 m-b-sm
        justify-content-space-between
        p-sm
        product-item'
        data-test-project-product-item
      >
        <div className='flex align-items-center w-50'>
          <ProductIcon product={productDefinition} />
          <div
            data-test-project-product-name
            className='m-l-sm'
          >
            {description}
          </div>
        </div>
        <div className='flex align-items-center  w-50'>
          <div className='position-relative w-30'>
            {includeHeader ? <div className='item-title'>{t('project.products.updated')}</div> : ''}
            <TimezoneLabel dateTime={dateUpdated}/>
          </div>
          <div className='position-relative m-l-sm w-30'>
            {includeHeader ? <div className='item-title'>{t('project.products.published')}</div> : ''}
            <TimezoneLabel dateTime={datePublished} emptyLabel={t('project.products.unpublished')} />
          </div>
          <div className='m-l-sm w-30'>
            <button className='ui button'>{t('project.products.rebuild')}</button>
          </div>
          <div className='flex w-10 m-l-md'>
            <ItemActions />
          </div>

        </div>
      </div>
    );
  }

}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps),
  withLoader(({productDefinition}) => !productDefinition)
)(ProductItem);