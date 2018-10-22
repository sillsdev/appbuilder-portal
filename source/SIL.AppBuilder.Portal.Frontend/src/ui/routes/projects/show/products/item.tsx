import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import * as moment from 'moment-timezone';

import {
  ProductResource,
  ProductDefinitionResource,
  withLoader,
  attributesFor
} from '@data';

import ItemActions from './item-actions';
import ProductIcon from '@ui/components/product-icon';
import {
  withMomentTimezone,
  IProvidedProps as TimezoneProps
} from '@lib/with-moment-timezone';

interface IOwnProps {
  includeHeader?: boolean;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
}

type IProps =
  & IOwnProps
  & TimezoneProps;

const mapRecordsToProps = (passedProps) => {
  const { product } = passedProps;
  return {
    productDefinition: q => q.findRelatedRecord(product, 'productDefinition')
  };
};

class ProductItem extends React.Component<IProps> {

  render() {

    const { product, productDefinition, timezone, includeHeader } = this.props;
    const { description } = attributesFor(productDefinition);
    const { dateUpdated, datePublished } = attributesFor(product);

    const dateUpdatedTZ = moment(dateUpdated + "Z").tz(timezone);
    const datePublishedTZ = moment(datePublished + "Z").tz(timezone);

    return (
      <div
        className='col flex w-100-xs-only
        flex-100 m-b-sm justify-content-space-between product-item'
        data-test-product-item
      >
        <div className='flex align-items-center w-50'>
          <ProductIcon product={productDefinition} />
          <div className='m-l-md'>{description}</div>
        </div>
        <div className='flex align-items-center  w-50'>
          <div className='position-relative w-30'>
            {includeHeader ? <div className='item-title'>Updated</div> : ''}
            <span title={dateUpdatedTZ.format('MMMM Do YYYY, h:mm:ss')}>
              {dateUpdatedTZ.fromNow(true)}
            </span>
          </div>
          <div className='position-relative m-l-sm w-30'>
            {includeHeader ? <div className='item-title'>Published</div> : ''}
            <span title={datePublishedTZ.format('MMMM Do YYYY, h:mm:ss')}>
              {datePublished ? datePublishedTZ.fromNow(true) : 'unpublished'}
            </span>
          </div>
          <div className='m-l-sm w-30'>
            <button className='ui button'>REBUILD</button>
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
  withOrbit(mapRecordsToProps),
  withLoader(({productDefinition}) => !productDefinition),
  withMomentTimezone
)(ProductItem);