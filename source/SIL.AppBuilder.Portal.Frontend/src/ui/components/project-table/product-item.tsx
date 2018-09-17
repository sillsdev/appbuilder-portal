import * as React from 'react';

import ProductIcon from '@ui/components/product-icon';
import { ResourceObject } from 'jsonapi-typescript';
import { ProductAttributes } from '@data/models/product';
import { PRODUCTS_TYPE } from '@data';
import { attributesFor } from '@data/helpers';

import { IProvidedProps } from './withTableColumns';
import Column from './column';

interface IOwnProps {
  product: ResourceObject<PRODUCTS_TYPE, ProductAttributes>;
}

class ProductItem extends React.Component<IOwnProps & IProvidedProps> {

  render() {

    const { product, isInSelectedColumns, columnWidth } = this.props;
    const { name } = attributesFor(product);

    const columnStyle = {
      width: `${columnWidth()}%`
    }

    return (
      <div className='flex flex-column-xs flex-row-md grid product'>
        <div className='col flex-grow-xs w-100-xs-only' style={columnStyle}>
          <ProductIcon product={product} />
          {name}
        </div>
        <Column
          value='v1.0.0'
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('buildVersion')}
          style={columnStyle}
        />
        <Column
          value='2018-06-21'
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('buildDate')}
          style={columnStyle}
        />
        <Column
          value='2018-04-21'
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('createdOn')}
          style={columnStyle}
        />
        <Column
          value='2018-04-22'
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('updatedOn')}
          style={columnStyle}
        />
        <div className='action' />
      </div>
    );
  }

}

export default ProductItem;