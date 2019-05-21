import React, { useState, useCallback } from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { useTranslations } from '~/lib/i18n';
import * as toast from '~/lib/toast';

import { ProductSelection } from './product-selection';
import './styles.scss';

export function BulkProductSelection({ disabled, tableName }) {
  const { t } = useTranslations();
  const [isOpen, setOpen] = useState(false);
  const [selection, updateSelection] = useState([]);
  const close = () => setOpen(false);
  const open = () => setOpen(true);

  const onConfirm = useCallback(() => {
    console.log(selection);
    toast.success('yay');
    close();
  }, [selection]);

  return (
    <Modal
      data-test-bulk-product-selection
      className='medium bulk-selection-modal'
      open={isOpen}
      onClose={close}
      trigger={
        <button disabled={disabled} className='ui button basic blue m-r-md' onClick={open}>
          {t('common.build')}
        </button>
      }
      closeIcon={<CloseIcon className='close-modal' />}
    >
      <Modal.Header>{t('projects.bulk.buildModal.title')}</Modal.Header>
      <Modal.Content>
        <ProductSelection tableName={tableName} onChange={updateSelection} />
      </Modal.Content>
      <Modal.Actions>
        <button className='ui button' onClick={close}>
          Cancel
        </button>
        <button className='ui button primary' onClick={onConfirm}>
          Confirm
        </button>
      </Modal.Actions>
    </Modal>
  );
}
