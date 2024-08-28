import React, { useState, useCallback } from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';
import {
  ProductDefinitionResource,
  StoreTypeResource,
  StoreResource,
  attributesFor,
  OrganizationStoreResource,
} from '@data';
import { i18nProps, useTranslations } from '@lib/i18n';

import StoreSelect from './multi-select';

import { OverlayLoader } from '~/ui/components/loaders';

interface INeededProps {
  productDefinition: ProductDefinitionResource;
  storeType: StoreTypeResource;
  onStoreSelect: (store: StoreResource) => Promise<void>;
  onStoreCancel: () => void;
}

type IProps = i18nProps & INeededProps;

export default function StoreSelection({
  onStoreCancel,
  productDefinition,
  storeType,
  onStoreSelect,
}: IProps) {
  const { t } = useTranslations();
  const [selected, setSelected] = useState<OrganizationStoreResource[]>([]);
  const [isLoading, setLoading] = useState(false);

  const onChange = useCallback(
    (store: StoreResource) => {
      if (selected.length > 0) {
        return;
      }

      const fakeResource: any = { relationships: { store: { data: store } } };

      setLoading(true);
      setSelected([fakeResource]);
      onStoreSelect(store);
      // onStoreSelect will unmount this component,
      // so we don't need to worry about setting the
      // loading state again
      // setLoading(false);
    },
    [onStoreSelect, selected.length]
  );

  const { name } = attributesFor(productDefinition);

  return (
    <Modal
      data-test-project-product-store-select-modal
      open={true}
      className='medium p-relative'
      style={{ zIndex: 1 }}
      closeIcon={<CloseIcon className='close-modal' />}
      onClose={onStoreCancel}
    >
      {isLoading && <OverlayLoader style={{ zIndex: 2 }} />}

      <Modal.Header>{t('products.storeSelect', { name })}</Modal.Header>
      <Modal.Content>
        <StoreSelect
          {...{
            onChange,
            selected,
            ofStoreType: storeType,
          }}
        />
      </Modal.Content>

      <Modal.Actions>
        <button className='ui button huge' onClick={onStoreCancel}>
          {t('common.cancel')}
        </button>
      </Modal.Actions>
    </Modal>
  );
}
