import * as React from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { ProductDefinitionResource, StoreTypeResource, relationshipFor } from '@data';

import { i18nProps } from '@lib/i18n';

import StoreSelect from '@ui/components/inputs/store-multi-select';

interface INeededProps {
  productDefinition: ProductDefinitionResource;
  onStoreSelect: (store: StoreTypeResource) => Promise<void>;
  onStoreCancel: () => void;
}

export default class extends React.Component<INeededProps & i18nProps> {
  render() {
    const { t, onStoreSelect, onStoreCancel, productDefinition } = this.props;

    const workflow = relationshipFor(productDefinition, 'workflow');
    const storeType = relationshipFor(workflow, 'storeType');

    return (
      <Modal
        data-test-project-product-store-select-modal
        open={true}
        className='medium'
        closeIcon={<CloseIcon className='close-modal' />}
        onClose={onStoreCancel}
      >
        <Modal.Header>{t('project.products.popup.title')}</Modal.Header>
        <Modal.Content>
          <StoreSelect onChange={onStoreSelect} selected={[]} ofStoreType={storeType} />
        </Modal.Content>

        <Modal.Actions>
          <button className='ui button huge' onClick={onStoreCancel}>
            {t('common.cancel')}
          </button>
        </Modal.Actions>
      </Modal>
    );
  }
};
