import * as React from 'react';
import { ResourceObject } from 'jsonapi-typescript';

import { attributesFor, relationshipFor } from '@data';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';
import { i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
import { IAttributeProps } from '@lib/dom';

interface IOwnProps<T> {
  selectedItemJoinsWith: string;
  list: T[];
  selected: T[];
  onChange: (el: T) => void;
  emptyListLabel?: string;
  displayProductIcon?: boolean;
}

type IProps<T> =
  & IOwnProps<T>
  & i18nProps
  & IAttributeProps;

export class MultiSelect<T extends ResourceObject> extends React.Component<IProps<T>> {

  onChange = (element) => (e) => {
    e.preventDefault();
    this.props.onChange(element);
  }

  inSelectedList = (element) => {

    const { selected, selectedItemJoinsWith } = this.props;

    const el = selected.find(selectedItem => {
      const { data } = relationshipFor(selectedItem, selectedItemJoinsWith);
      return data.id === element.id;
    });

    return el !== undefined;
  }

  render() {

    const { list, emptyListLabel, displayProductIcon, t } = this.props;
    const emptyLabel = emptyListLabel || t('common.noResults');

    if (isEmpty(list)) {
      return (
        <div data-test-multi-select>
          <div data-test-empty-list className='empty-list'>
            {emptyLabel}
          </div>
        </div>
      );
    }

    return (
      <div data-test-multi-select>
      {
        list.map((element, index) => {

          const isSelected = this.inSelectedList(element);

          return (
            <div
              key={index}
              className={`flex flex-column align-items-center
              w-100 m-b-sm round-border-4 light-gray-text pointer
              ${ isSelected ? 'blue-light-border' : 'thin-border'}`}
              data-test-item
              onClick={this.onChange(element)}
            >
              <div
                className={`flex flex-row align-items-center
                w-100 p-sm bg-lightest-gray fs-14 round-border-4
                ${ isSelected ? 'blue-light-bottom-border' : 'thin-bottom-border'}`}
              >
                <Checkbox
                  data-test-item-checkbox
                  className='m-r-sm'
                  value={element.id}
                  checked={isSelected}
                />
                {
                  displayProductIcon &&
                  <ProductIcon product={element} selected={isSelected} size={19} />
                }
                <span
                  data-test-item-text
                  className={`p-l-xs-xs ${isSelected && 'black-text'}`}
                >
                  {attributesFor(element).name}
                </span>
              </div>
              <div className='w-100 p-sm p-t-md p-b-md fs-11'>
                <span>{attributesFor(element).description}</span>
              </div>
            </div>
          );
        })
      }
      </div>
    );
  }
}