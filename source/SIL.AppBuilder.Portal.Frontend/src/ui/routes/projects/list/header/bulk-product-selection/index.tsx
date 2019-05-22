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
  const [permissions, setPermissions] = useState({});

  const close = () => setOpen(false);
  const open = () => setOpen(true);

  const actions = Object.keys(permissions);

  const onConfirm = useCallback(
    (action) => {
      if (selection.length === 0) {
        close();
        return;
      }

      console.log(action, selection);
      toast.success('yay');
      close();
    },
    [selection]
  );

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
        <ProductSelection
          tableName={tableName}
          onChange={updateSelection}
          onPermissionRetrieval={setPermissions}
        />
      </Modal.Content>
      <Modal.Actions>
        <button className='ui button' onClick={close}>
          Cancel
        </button>

        {actions.map((action) => {
          return (
            <button
              key={action}
              disabled={isSelectionAllowed(action, selection, permissions)}
              className='ui button primary'
              onClick={() => onConfirm(action)}
            >
              {t(`products.actions.${action.toLowerCase()}`)}
            </button>
          );
        })}
      </Modal.Actions>
    </Modal>
  );
}

function isSelectionAllowed(action: string, selection: string[], permissions: any) {
  return selection.every((productId) => permissions[action].includes(productId));
}
