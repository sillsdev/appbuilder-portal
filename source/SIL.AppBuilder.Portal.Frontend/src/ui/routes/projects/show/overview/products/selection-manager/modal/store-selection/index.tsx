import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import {
  ProductDefinitionResource,
  StoreTypeResource,
  StoreResource,
  attributesFor,
  OrganizationStoreResource,
} from '@data';

import { i18nProps } from '@lib/i18n';

import StoreSelect from './multi-select';

interface INeededProps {
  productDefinition: ProductDefinitionResource;
  storeType: StoreTypeResource;
  onStoreSelect: (store: StoreResource) => Promise<void>;
  onStoreCancel: () => void;
}

type IProps = i18nProps & INeededProps;

interface IState {
  selected: OrganizationStoreResource[];
}

export default class extends React.Component<IProps, IState> {
  state = { selected: [] };

  onChange = (store: StoreResource) => {
    if (this.state.selected.length > 0) {
      return;
    }

    const fakeResource: any = { relationships: { store: { data: store } } };

    this.setState({ selected: [fakeResource] }, () => this.props.onStoreSelect(store));
  };

  render() {
    const { t, onStoreCancel, productDefinition, storeType } = this.props;

    const { name } = attributesFor(productDefinition);

    const selectProps = {
      onChange: this.onChange,
      selected: this.state.selected,
      ofStoreType: storeType,
    };

    return (
      <Modal
        data-test-project-product-store-select-modal
        open={true}
        className='medium'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={onStoreCancel}
      >
        <Modal.Header>{t('products.storeSelect', { name })}</Modal.Header>
        <Modal.Content>
          <StoreSelect {...selectProps} />
        </Modal.Content>

        <Modal.Actions>
          <button className='ui button huge' onClick={onStoreCancel}>
            {t('common.cancel')}
          </button>
        </Modal.Actions>
      </Modal>
    );
  }
}
