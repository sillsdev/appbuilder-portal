import * as React from 'react';
import { ResourceObject } from 'jsonapi-typescript';

import { attributesFor, relationshipFor } from '@data';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';

import { isEmpty } from '@lib/collection';

interface IOwnProps<T> {
  className?: string;
  relationshipName: string;
  list: T[];
  selected: T[];
  onChange: (el: T) => void;
  emptyListLabel: string;
}

export class MultiSelect<T extends ResourceObject> extends React.Component<IOwnProps<T>> {

  onChange = (element) => (e) => {
    e.preventDefault();
    this.props.onChange(element);
  }

  inSelectedList = (element) => {

    const { selected, relationshipName } = this.props;

    const el = selected.find(selectedItem => {
      const { data } = relationshipFor(selectedItem, relationshipName);
      return data.id === element.id;
    });

    return el !== undefined;
  }

  render() {

    const { list, emptyListLabel } = this.props;

    if (isEmpty(list)) {
      return (
        <div data-test-multi-select>
          <div data-test-empty-list className='empty-list'>
            {emptyListLabel}
          </div>
        </div>
      );
    }

    return (
      <div data-test-multi-select>
      {
        list.map((element, index) => (
          <div
            key={index}
            className='col flex align-items-center w-100-xs-only flex-100 m-b-sm multi-select-item'
            data-test-item
            onClick={this.onChange(element)}
          >
            <Checkbox
              data-test-item-checkbox
              className='m-r-md'
              value={element.id}
              checked={this.inSelectedList(element)}
            />
            <ProductIcon product={element} />
            <span
              data-test-item-text
              className='p-l-sm-xs'
            >
              {attributesFor(element).description}
            </span>
          </div>
        ))
      }
      </div>
    );
  }
}