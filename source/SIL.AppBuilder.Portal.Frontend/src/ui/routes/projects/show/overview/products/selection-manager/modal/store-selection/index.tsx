import * as React from 'react';
import { compose } from 'recompose';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import {
  ProductDefinitionResource,
  StoreTypeResource,
  relationshipFor,
  attributesFor,
} from '@data';

import { i18nProps } from '@lib/i18n';

import StoreSelect from './multi-select';

interface INeededProps {
  productDefinition: ProductDefinitionResource;
  storeType: StoreTypeResource;
  onStoreSelect: (store: StoreTypeResource) => Promise<void>;
  onStoreCancel: () => void;
}

type IProps = i18nProps & INeededProps;

export default compose<IProps, INeededProps>()(
  class extends React.Component<IProps> {
    render() {
      const { t, onStoreSelect, onStoreCancel, productDefinition, storeType } = this.props;

      const { name } = attributesFor(productDefinition);

      const selectProps = {
        onChange: onStoreSelect,
        selected: [],
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
);
