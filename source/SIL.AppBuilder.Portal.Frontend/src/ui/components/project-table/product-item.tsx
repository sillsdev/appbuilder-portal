import * as React from 'react';
import { compose } from 'recompose';

import ProductIcon from '@ui/components/product-icon';
import { ResourceObject } from 'jsonapi-typescript';
import { ProductAttributes } from '@data/models/product';
import { PRODUCTS_TYPE } from '@data';
import { attributesFor } from '@data/helpers';

import { IProvidedProps } from './withTableColumns';
import Column from './column';
import { withTranslations } from '@lib/i18n';
import { withMomentTimezone, IProvidedProps as TimeProps } from '@lib/with-moment-timezone';

interface IOwnProps {
  product: ResourceObject<PRODUCTS_TYPE, ProductAttributes>;
}

type IProps =
  & IOwnProps
  & IProvidedProps
  & TimeProps

class ProductItem extends React.Component<IProps> {

  render() {

    const {
      product,
      isInSelectedColumns,
      columnWidth,
      moment,
      timezone
    } = this.props;

    const {
      name,
      buildVersion,
      buildDate,
      createdOn,
      updatedOn
    } = attributesFor(product);

    const columnStyle = {
      width: `${columnWidth()}%`
    };

    return (
      <div className='flex flex-column-xs flex-row-md grid product'>
        <div className='col flex-grow-xs w-100-xs-only' style={columnStyle}>
          <ProductIcon product={product} />
          {name}
        </div>
        <Column
          value={buildVersion}
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('buildVersion')}
          style={columnStyle}
        />
        <Column
          value={moment.tz(buildDate, timezone).format('L')}
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('buildDate')}
          style={columnStyle}
        />
        <Column
          value={moment.tz(createdOn, timezone).format('L')}
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('createdOn')}
          style={columnStyle}
        />
        <Column
          value={moment.tz(updatedOn, timezone).format('L')}
          className='col flex-grow-xs w-100-xs-only'
          display={isInSelectedColumns('updatedOn')}
          style={columnStyle}
        />
        <div className='action' />
      </div>
    );
  }

}

export default compose(
  withTranslations,
  withMomentTimezone
)(ProductItem);