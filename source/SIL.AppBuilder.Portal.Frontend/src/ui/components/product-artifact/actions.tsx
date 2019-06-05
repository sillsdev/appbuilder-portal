import React, { useCallback, useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Dropdown } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';

import { handleResponse } from '~/data/containers/with-current-user/fetcher';

import { put, get } from '~/lib/fetch';

import * as toast from '~/lib/toast';

import { preventDefault } from '~/lib/dom';

export default function ItemActions({ product }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const [actions, setActions] = useState([]);

  const hasActions = actions.length > 0;
  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;

  useEffect(() => {
    async function fetcher() {
      let response = await get(`/api/products/${productRemoteId}/actions`);

      try {
        let json = await response.json();

        let { actions } = attributesFor(json.data);

        setActions(actions || []);
      } catch (e) {
        console.debug('actions not ready, or do not exist');
      }
    }

    fetcher();
  }, [productRemoteId, actions.length === 0]);

  const invokeAction = useCallback(
    async (actionName: string) => {
      let response = await put(`/api/products/${productRemoteId}/actions/${actionName}`);

      if (response.status >= 400) {
        try {
          let errorJson = await response.json();
          return toast.error(errorJson);
        } catch (e) {
          return toast.error(response.statusText);
        }
      }

      try {
        await handleResponse(response, t);

        toast.success(t('products.actions.executed', { actionName }));
        setActions([]); // refetch
      } catch (e) {
        toast.error(e);
      }
    },
    [productRemoteId, t]
  );

  return (
    <Dropdown
      pointing='top right'
      icon={null}
      trigger={<MoreVerticalIcon />}
      className='line-height-0'
    >
      <Dropdown.Menu>
        {!hasActions && (
          <Dropdown.Item className='capitalize' text={t(`products.actions.noneAvailable`)} />
        )}

        {actions.map((actionName) => {
          return (
            <Dropdown.Item
              key={actionName}
              className='capitalize'
              text={t(`products.actions.${actionName.toLowerCase()}`)}
              onClick={preventDefault(() => invokeAction(actionName))}
            />
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}
