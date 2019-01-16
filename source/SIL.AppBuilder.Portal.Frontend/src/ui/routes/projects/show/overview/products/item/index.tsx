import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProductResource, ProductDefinitionResource, withLoader, attributesFor } from '@data';

import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';
import ProductIcon from '@ui/components/product-icon';
import TimezoneLabel from '@ui/components/labels/timezone';
import { Link } from 'react-router-dom';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import ItemActions from './actions';

interface IOwnProps {
  includeHeader?: boolean;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
}

type IProps = IOwnProps & i18nProps;

const mapRecordsToProps = (passedProps) => {
  const { product } = passedProps;

  return {
    productDefinition: (q) => q.findRelatedRecord(product, 'productDefinition'),
  };
};

class ProductItem extends React.Component<IProps> {
  render() {
    const { product, productDefinition, t, includeHeader } = this.props;
    const { description, name } = attributesFor(productDefinition);
    const { dateUpdated, datePublished, publishLink } = attributesFor(product);

    return (
      <div
        className='flex-md w-100-xs-only
        flex-100 m-b-sm position-relative
        justify-content-space-between
        align-items-center
        p-md fs-13 light-gray-text
        round-border-4 thin-border'
        data-test-project-product-item
      >
        <div className='flex align-items-center w-55-md'>
          <ProductIcon product={productDefinition} selected={true} />
          <div data-test-project-product-name className='m-l-sm fs-16 bold blue-highlight'>
            {name}
          </div>
          {!isEmpty(publishLink) && (
            <div data-test-project-product-publishlink>
              <IconButton component={Link} to={publishLink} target='_blank'>
                <LaunchIcon />
              </IconButton>
            </div>
          )}
        </div>
        <div className='w-20-md p-l-xs-md'>
          <span className='d-md-none m-r-sm bold'>{t('project.products.updated')}:</span>
          <TimezoneLabel dateTime={dateUpdated} emptyLabel='--' />
        </div>
        <div className='p-l-sm-md w-20-md'>
          <span className='d-md-none m-r-sm bold'>{t('project.products.published')}:</span>
          <TimezoneLabel dateTime={datePublished} emptyLabel='--' />
        </div>
        <div className='flex w-5-md p-l-md-md move-right'>
          <ItemActions />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps),
  withLoader(({ productDefinition }) => !productDefinition)
)(ProductItem);
