import * as React from 'react';
import { i18nProps, withTranslations } from '@lib/i18n';
import { applyNumberOfTimes } from '@lib/collection';

import { IProvidedProps as IColumnProps } from '../../with-table-columns';

import ProductItem from './product-item';

type IProps = i18nProps & IColumnProps;

class Products extends React.Component<IProps> {
  render() {
    const { activeProductColumns, activeProjectColumns, t, products } = this.props;
    const hasProducts = products && products.length > 0;

    let padding = activeProjectColumns.length - activeProductColumns.length;
    padding = Math.max(0, padding);

    return (
      <div className='products-grid p-t-sm'>
        {hasProducts && (
          <>
            <div className='flex grid products-header flex-grow'>
              <div className='flex-grow-xs product-xs-only flex-100 p-l-md p-r-md'>
                {t('projectTable.products')}
              </div>

              {activeProductColumns.map((column, i) => (
                <div
                  key={i}
                  data-test-project-table-column
                  className={'d-xs-only-none flex-100 p-l-md p-r-md'}
                >
                  {t(column.i18nKey)}
                </div>
              ))}

              {applyNumberOfTimes(padding, (i) => (
                <div
                  key={i}
                  data-test-project-table-column
                  className={'col bold flex-100 p-l-md p-r-md'}
                >
                  &nbsp;
                </div>
              ))}

              <div className='action d-xs-none d-md-block' />
            </div>

            {products.map((product, index) => (
              <ProductItem key={index} {...this.props} product={product} />
            ))}
          </>
        )}

        {!hasProducts && (
          <div className='flex grid products-header flex-grow p-md'>
            <div className='col flex-grow-xs product-xs-only flex-100'>
              {t('projectTable.noProducts')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withTranslations(Products);
