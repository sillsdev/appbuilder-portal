import * as React from 'react';
import { compose } from 'recompose';

import { attributesFor } from '@data/helpers';

import ProductIcon from '@ui/components/product-icon';
import { ProductResource } from '@data/models/product';

import { withMomentTimezone, IProvidedProps as TimeProps } from '@lib/with-moment-timezone';
import { withTranslations } from '@lib/i18n';

import { IProvidedProps as IColumnProps } from '../../with-table-columns';
import { COLUMN_KEY } from '../../column-data';

interface IOwnProps {
  product: ProductResource;
}

type IProps =
  & IOwnProps
  & IColumnProps
  & TimeProps;

class ProductItem extends React.Component<IProps> {
  getActiveProductColumns = () => {
    const { product, moment, timezone, activeProductColumns } = this.props;

    const {
      name,
      buildVersion,
      buildDate,
      createdOn,
      updatedOn
    } = attributesFor(product);

    return activeProductColumns.map((column) => {
      switch(column.id) {
        case COLUMN_KEY.PRODUCT_BUILD_DATE:
          column.value = moment.tz(buildDate, timezone).format('L');
          break;
        case COLUMN_KEY.PRODUCT_BUILD_VERSION:
          column.value = buildVersion;
          break;
        case COLUMN_KEY.PRODUCT_CREATED_ON:
          column.value = moment.tz(createdOn, timezone).format('L');
          break;
        case COLUMN_KEY.PRODUCT_UPDATED_ON:
          column.value = moment.tz(updatedOn, timezone).format('L');
          break;
        default:
          column.value = 'active column not recognized';
      }

      return column;
    });
  }

  render() {
    const { product } = this.props;

    const activeProductColumns = this.getActiveProductColumns();

    return (
      <div className='flex flex-column-xxs flex-row-xs grid product'>
        <div className='col flex align-items-center w-100-xs-only flex-100'>
          <ProductIcon product={product} />
          <span className='p-l-sm-xs'>{name}</span>
        </div>

        { activeProductColumns.map((column, i) => (
          <div key={i} data-test-project-table-column className={'col bold flex-100'}>
            {column.value}
          </div>
        ))}

        <div className='action' />
      </div>
    );
  }

}

export default compose(
  withTranslations,
  withMomentTimezone
)(ProductItem);