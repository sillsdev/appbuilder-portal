import * as React from 'react';
import { i18nProps, withTranslations } from '@lib/i18n';

import { IProvidedProps as IColumnProps } from '../../with-table-columns';
import ProductItem from './product-item';


type IProps =
& i18nProps
& IColumnProps;


// TODO: Remove this when we had products associated to projects
const products = [{
  id: '1',
  type: 'products',
  attributes: {
    name: 'HTML',
    buildVersion: '1.0.0',
    buildDate: new Date(),
    createdOn: new Date(),
    updatedOn: new Date()
  }
},{
  id: '2',
  type: 'products',
    attributes: {
      name: 'Android APK (Streaming Audio)',
      buildVersion: '1.0.0',
      buildDate: new Date(),
      createdOn: new Date(),
      updatedOn: new Date()
    }
}];

class Products extends React.Component<IProps> {
  render() {
    const { activeProductColumns, t } = this.props;

    return (
      <div className='products-grid'>
        <div className='flex grid products-header flex-graw'>
          <div className='col flex-grow-xs product-xs-only flex-100'>
            Products
          </div>

          { activeProductColumns.map((column, i) => (
            <div key={i} data-test-project-table-column className={'col d-xs-only-none flex-100'}>
              {t(column.i18nKey)}
            </div>
          ))}

          <div className='action d-xs-none d-md-block' />
        </div>
        {
          products && products.map((product, index) => {
            return <ProductItem key={index} { ...this.props } product={product} />;
          })
        }
      </div>
    );

  }

}

export default withTranslations( Products );