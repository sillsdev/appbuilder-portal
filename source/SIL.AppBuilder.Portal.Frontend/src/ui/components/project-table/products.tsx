import * as React from 'react';

import ProductItem from './product-item';
import { IProvidedProps } from './withTableColumns';
import Column from './column';

// TODO: Remove this when we had products associated to projects
const products = [{
  id: '1',
  type: 'products',
  attributes: { name: 'HTML' }
},{
  id: '2',
  type: 'products',
  attributes: { name: 'Android APK (Streaming Audio)' }
}];

class Products extends React.Component<IProvidedProps> {

  render() {

    const { isInSelectedColumns, columnWidth } = this.props;

    const columnStyle = {
      width: `${columnWidth()}%`
    };

    return (
      <div className='products-grid'>
        <div className='flex grid products-header'>
          <div className='flex justify-content-space-evenly flex-grow-xs'>
            <div className='col flex-grow-xs product-xs-only' style={columnStyle}>
              Products
            </div>
            <Column
              value='Version'
              className='col flex-grow-xs d-xs-none d-md-block'
              display={isInSelectedColumns('buildVersion')}
              style={columnStyle}
            />
            <Column
              value='Build Date'
              className='col flex-grow-xs d-xs-none d-md-block'
              display={isInSelectedColumns('buildDate')}
              style={columnStyle}
            />
            <Column
              value='Created On'
              className='col flex-grow-xs d-xs-none d-md-block'
              display={isInSelectedColumns('createdOn')}
              style={columnStyle}
            />
            <Column
              value='Updated On'
              className='col flex-grow-xs d-xs-none d-md-block'
              display={isInSelectedColumns('updatedOn')}
              style={columnStyle}
            />
          </div>
          <div className='action d-xs-none d-md-block' />
        </div>
        {
          products && products.map((product, index) => {

            const productItemProps = {
              product,
              isInSelectedColumns,
              columnWidth
            };

            return <ProductItem key={index} {...productItemProps} />;
          })
        }
      </div>
    );

  }

}

export default Products;