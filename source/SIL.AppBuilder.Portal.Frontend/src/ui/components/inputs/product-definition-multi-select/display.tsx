import * as React from 'react';

import { attributesFor, ProductDefinitionResource } from '@data';
import { i18nProps } from '@lib/i18n';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';

import './styles.scss';

interface IOwnProps {
  className?: string;
  productDefinitions: ProductDefinitionResource[];
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

  render() {

    const { productDefinitions } = this.props;

    return (
      productDefinitions.map((pd, index) => (
        <div
          key={index}
          className='col flex align-items-center w-100-xs-only flex-100 product-definition-item'
          onClick={this.onChange(pd)}
        >
          <Checkbox
            data-test-multi-group-checkbox
            value={pd.id}
            label=''
          />
          <ProductIcon product={pd} />
          <span className='p-l-sm-xs'>{attributesFor(pd).name}</span>
        </div>
      ))
    );
  }
}

