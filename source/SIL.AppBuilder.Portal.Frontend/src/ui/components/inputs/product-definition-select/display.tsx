import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor, ProductDefinitionResource } from '@data';
import { i18nProps } from '@lib/i18n';
import { filterForValidAttributes } from '@lib/dom';

interface IOwnProps {
  className?: string;
  productDefinitions: ProductDefinitionResource[];
  onChange: (value: string) => void;
  defaultValue: string;
}

export type IProps =
& IOwnProps
& i18nProps;

export class Display extends React.Component<IProps> {
  onChange = (e, dropdownEvent) => {
    e.preventDefault();

    this.props.onChange(dropdownEvent.value);
  }

  render() {
    const { productDefinitions, defaultValue, t, ...otherProps } = this.props;

    const options = [{ text: t('productDefinitions.all'), value: 'all' }].concat(
      productDefinitions.map(pd => ({
        text: attributesFor(pd).name || '',
        value: pd.id
      }))
    );

    const dropdownProps = {
      options,
      defaultValue,
      onChange: this.onChange,
      ...filterForValidAttributes(otherProps),
    };

    return (
      <Dropdown
        data-test-product-definition-select
        { ...dropdownProps }
      />
    );
  }
}

