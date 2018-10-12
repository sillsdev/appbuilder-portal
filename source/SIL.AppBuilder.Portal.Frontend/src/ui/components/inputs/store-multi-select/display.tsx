import * as React from 'react';

import { attributesFor, StoreResource, relationshipFor } from '@data';
import { i18nProps } from '@lib/i18n';
import { Checkbox } from 'semantic-ui-react';

import { isEmpty } from '@lib/collection';

interface IOwnProps {
  className?: string;
  stores: StoreResource[];
  selected: StoreResource[];
  onChange: (pd: StoreResource) => void;
  defaultValue: string;
}

export type IProps =
  & IOwnProps
  & i18nProps;

export class Display extends React.Component<IProps> {

  onChange = (store) => (e) => {
    e.preventDefault();
    this.props.onChange(store);
  }

  inSelectedList = (store: StoreResource) => {

    const { selected } = this.props;

    const el = selected.find(opd => {
      const { data } = relationshipFor(opd,'store');
      return data.id === store.id;
    });

    return el !== undefined;
  }

  render() {

    const { stores, t } = this.props;

    if (isEmpty(stores)) {
      return (
        <div data-test-empty-products className='no-stores'>
          {t('org.nostores')}
        </div>
      );
    }

    return (
      stores.map((pd, index) => (
        <div
          key={index}
          className='col flex align-items-center w-100-xs-only flex-100 m-b-sm multi-select-item'
          data-test-store
          onClick={this.onChange(pd)}
        >
          <Checkbox
            data-test-store-checkbox
            className='m-r-md'
            value={pd.id}
            checked={this.inSelectedList(pd)}
          />
          <span
            data-test-store-text
            className='p-l-sm-xs'
          >
            {attributesFor(pd).description}
          </span>
        </div>
      ))
    );
  }
}

