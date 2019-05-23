import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from 'semantic-ui-react';
import CloseIcon from '@material-ui/icons/Close';

import { useTranslations } from '~/lib/i18n';

import { post as authenticatedPost, tryParseJson } from '~/lib/fetch';

import * as toast from '~/lib/toast';

import './styles.scss';
import { useAsyncFn } from 'react-use';

import LoadingWrapper from '~/ui/components/loading-wrapper';

import { ErrorMessage } from '~/ui/components/errors';

import { GenericJsonApiError } from '~/data/errors/generic-jsonapi-error';

import { toSentence } from '~/lib/collection';

import { async } from 'rxjs/internal/scheduler/async';

import { ProductSelection } from './product-selection';

export function BulkProductSelection({ disabled, tableName }) {
  const { t } = useTranslations();
  const { isOpen, close, open } = useModalState();
  const [selection, updateSelection] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [selectedAction, setAction] = useState(undefined);

  const actions = Object.keys(permissions);
  const hasSelections = selection.length > 0;

  const { runState } = useActionRunner({
    permissions,
    selectedAction,
    selection,
    setAction,
    close,
  });

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
        <LoadingWrapper isLoading={runState.loading}>
          {hasSelections && (
            <MaybeRenderError
              {...{
                actions,
                permissions,
                selection,
              }}
            />
          )}

          <ProductSelection
            tableName={tableName}
            onChange={updateSelection}
            onPermissionRetrieval={setPermissions}
          />
        </LoadingWrapper>
      </Modal.Content>
      <Modal.Actions>
        <button className='ui button' disabled={runState.loading} onClick={close}>
          Cancel
        </button>

        {actions.map((action) => {
          const isActionDisabled = !hasAtLeastOneProductForAction(action, selection, permissions);

          return (
            <button
              key={action}
              disabled={isActionDisabled || runState.loading}
              className='ui button primary'
              onClick={() => setAction(action)}
            >
              {t(`products.actions.${action.toLowerCase()}`)}
            </button>
          );
        })}
      </Modal.Actions>
    </Modal>
  );
}

function useActionRunner({ selectedAction, selection, setAction, close, permissions }) {
  const { t } = useTranslations();

  const fetcher = useCallback(async () => {
    if (!selectedAction || selection.length === 0) {
      close();
      return;
    }

    const allowedIds = permissions[selectedAction];
    const validProductIds = selection.filter((productId) => {
      return allowedIds.includes(productId);
    });

    const response = await authenticatedPost('/api/product-actions/run', {
      data: {
        action: selectedAction,
        products: validProductIds,
      },
      headers: {
        ['Content-Type']: 'application/json',
      },
    });

    if (response.status >= 400) {
      setAction(undefined);

      const json = await tryParseJson(response);

      throw new GenericJsonApiError(response.status, response.statusText, json);
    }

    toast.success(
      t(`products.actions.dispatched`, {
        action: t(`products.actions.${selectedAction.toLowerCase()}`),
      })
    );
    close();
  }, [selectedAction, selection, permissions, t, close, setAction]);

  const [runState, runAction] = useAsyncFn(fetcher, [fetcher]);

  useEffect(() => {
    if (selectedAction) {
      runAction();
      setAction(undefined);
    }
  }, [selectedAction, selection, runAction, setAction]);

  useEffect(() => {
    if (runState.error) {
      toast.error(t('errors.generic', { errorMessage: runState.error }));
    }
  }, [runState.error, t]);

  return { runState, runAction };
}

function MaybeRenderError({ actions, permissions, selection }) {
  const { t } = useTranslations();

  const actionsWithErrors = actions.filter((action) => {
    const isActionDisabled = !isSelectionAllowed(action, selection, permissions);

    return isActionDisabled;
  });

  const translated = actionsWithErrors.map((action) =>
    t(`products.actions.${action.toLowerCase()}`)
  );

  const message = t('products.actions.bulkNotAllAllowed', {
    action: toSentence(translated, 'or'),
  });

  return <ErrorMessage error={message} />;
}

function useModalState(initial = false) {
  const [isOpen, setOpen] = useState(false);

  const close = () => setOpen(false);
  const open = () => setOpen(true);

  return { isOpen, open, close };
}

function hasAtLeastOneProductForAction(action, selection, permissions) {
  if (selection.length === 0) return false;

  const allowedProductIds = permissions[action];

  for (let i = 0; i < selection.length; i++) {
    const productId = selection[i];
    const allowed = allowedProductIds.includes(productId);

    if (allowed) {
      return true;
    }
  }

  return false;
}

function isSelectionAllowed(action: string, selection: string[], permissions: any) {
  if (selection.length === 0) return false;

  const allowedProductIds = permissions[action];

  for (let i = 0; i < selection.length; i++) {
    const productId = selection[i];
    const notAllowed = !allowedProductIds.includes(productId);

    if (notAllowed) {
      return false;
    }
  }

  return true;
}
