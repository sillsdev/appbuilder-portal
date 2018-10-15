import * as React from 'react';
import { ResourceObject } from 'jsonapi-typescript';

import { attributesFor, relationshipFor } from '@data';
import { i18nProps } from '@lib/i18n';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';

import { isEmpty } from '@lib/collection';

interface IOwnProps<T> {
  className?: string;
  name: string;
  list: T[];
  selected: T[];
  onChange: (el: T) => void;
}

export type IProps<T extends ResourceObject> =
  & IOwnProps<T>
  & i18nProps;

export class MultiSelect extends React.Component<IProps<ResourceObject>> {

  onChange = (element) => (e) => {
    e.preventDefault();
    this.props.onChange(element);
  }

  inSelectedList = (element) => {

    const { selected, name } = this.props;

    const el = selected.find(selectedItem => {
      const { data } = relationshipFor(selectedItem, name);
      return data.id === element.id;
    });

    return el !== undefined;
  }

  render() {

    const { list, t } = this.props;

    if (isEmpty(list)) {
      return (
        <div data-test-empty-products className='no-product-definitions'>
          {t('org.noproducts')}
        </div>
      );
    }

    return (
      list.map((element, index) => (
        <div
          key={index}
          className='col flex align-items-center w-100-xs-only flex-100 m-b-sm multi-select-item'
          data-test-product-definition
          onClick={this.onChange(element)}
        >
          <Checkbox
            data-test-product-definition-checkbox
            className='m-r-md'
            value={element.id}
            checked={this.inSelectedList(element)}
          />
          <ProductIcon product={element} />
          <span
            data-test-product-definition-text
            className='p-l-sm-xs'
          >
            {attributesFor(element).description}
          </span>
        </div>
      ))
    );
  }
}