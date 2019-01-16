import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { titleize } from 'inflected';
import { attributesFor } from '@data/helpers';
import ProductIcon from '@ui/components/product-icon';

import { ProductResource, ProductDefinitionResource } from '@data';

import { withMomentTimezone, IProvidedProps as TimeProps } from '@lib/with-moment-timezone';
import { withTranslations, i18nProps } from '@lib/i18n';
import { applyNumberOfTimes } from '@lib/collection';

import { IProvidedProps as IColumnProps } from '../../with-table-columns';
import { COLUMN_KEY } from '../../column-data';

interface IOwnProps {
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
}

type IProps = IOwnProps & IColumnProps & i18nProps & TimeProps;

class ProductItem extends React.Component<IProps> {
  getActiveProductColumns = () => {
    const { t, product, moment, timezone, activeProductColumns, productDefinition } = this.props;

    const { buildVersion, buildDate, createdOn, updatedOn } = attributesFor(product);
    const { name } = attributesFor(productDefinition);

    return activeProductColumns.map((column) => {
      switch (column.id) {
        case COLUMN_KEY.PRODUCT_BUILD_DATE:
          column.value = moment(buildDate)
            .tz(timezone)
            .format('L');
          break;
        case COLUMN_KEY.PRODUCT_BUILD_VERSION:
          column.value = buildVersion || '-';
          break;
        case COLUMN_KEY.PRODUCT_CREATED_ON:
          column.value = moment(createdOn)
            .tz(timezone)
            .format('L');
          break;
        case COLUMN_KEY.PRODUCT_UPDATED_ON:
          column.value = moment(updatedOn)
            .tz(timezone)
            .format('L');
          break;
        default:
          column.value = 'active column not recognized';
      }

      return column;
    });
  };

  humanReadableName = () => {
    const { productDefinition } = this.props;
    const { name } = attributesFor(productDefinition);

    const readableName = titleize(name);

    return readableName;
  };

  render() {
    const { productDefinition, activeProjectColumns } = this.props;

    const activeProductColumns = this.getActiveProductColumns();

    let padding = activeProjectColumns.length - activeProductColumns.length;
    padding = Math.max(0, padding);

    return (
      <div className='flex flex-column-xxs flex-row-xs grid product p-b-sm p-t-sm'>
        <div className='col flex align-items-center w-100-xs-only flex-100 p-l-md p-r-md'>
          <ProductIcon product={productDefinition} selected={true} />
          <span className='p-l-sm-xs'>{this.humanReadableName()}</span>
        </div>

        {activeProductColumns.map((column, i) => (
          <div key={i} data-test-project-table-column className={'col bold flex-100 p-l-md p-r-md'}>
            {column.value}
          </div>
        ))}

        {applyNumberOfTimes(padding, (i) => (
          <div key={i} data-test-project-table-column className={'col bold flex-100 p-l-md p-r-md'}>
            &nbsp;
          </div>
        ))}

        <div className='action d-xs-none d-md-block' />
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withMomentTimezone,
  withOrbit(({ product }) => ({
    productDefinition: (q) => q.findRelatedRecord(product, 'productDefinition'),
  }))
)(ProductItem);
