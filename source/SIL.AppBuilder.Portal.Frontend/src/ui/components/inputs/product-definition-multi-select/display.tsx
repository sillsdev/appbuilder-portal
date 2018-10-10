import * as React from 'react';

import { attributesFor, ProductDefinitionResource, relationshipFor } from '@data';
import { i18nProps } from '@lib/i18n';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';

import { isEmpty } from '@lib/collection';

interface IOwnProps {
  className?: string;
  productDefinitions: ProductDefinitionResource[];
  selected: ProductDefinitionResource[];
  onChange: (pd: ProductDefinitionResource) => void;
  defaultValue: string;
}

export type IProps =
  & IOwnProps
  & i18nProps;

export class Display extends React.Component<IProps> {

  onChange = (productDefinition) => (e) => {
    e.preventDefault();
    this.props.onChange(productDefinition);
  }

  inSelectedList = (productDefinition: ProductDefinitionResource) => {

    const { selected } = this.props;

    const el = selected.find(opd => {
      const { data } = relationshipFor(opd,'productDefinition');
      return data.id === productDefinition.id;
    });

    return el !== undefined;
  }

  render() {

    const { productDefinitions, t } = this.props;

    if (isEmpty(productDefinitions)) {
      return (
        <div data-test-empty-products className='no-product-definitions'>
          {t('org.noproducts')}
        </div>
      );
    }

    return (
      productDefinitions.map((pd, index) => (
        <div
          key={index}
          className='col flex align-items-center w-100-xs-only flex-100 m-b-sm multi-select-item'
          data-test-product-definition
          onClick={this.onChange(pd)}
        >
          <Checkbox
            data-test-product-definition-checkbox
            className='m-r-md'
            value={pd.id}
            checked={this.inSelectedList(pd)}
          />
          <ProductIcon product={pd} />
          <span
            data-test-product-definition-text
            className='p-l-sm-xs'
          >
            {attributesFor(pd).name}
          </span>
        </div>
      ))
    );
  }
}

