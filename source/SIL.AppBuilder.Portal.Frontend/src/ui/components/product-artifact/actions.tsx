import React, { useCallback, useEffect, useState } from 'react';
import { useOrbit, useCache, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useTranslations } from '@lib/i18n';
import { useDebounce } from 'use-debounce';
import TransitionDetails from '@ui/components/product-transitions/details';
import ProductProperties from '@ui/components/product-properties';
import { ROLE } from '@data/models/role';
import { RequireRole } from '@ui/components/authorization';

import { useLiveData } from '~/data/live';
import { handleResponse } from '~/data/containers/with-current-user/fetcher';
import { post, get } from '~/lib/fetch';
import * as toast from '~/lib/toast';
import { preventDefault } from '~/lib/dom';

export default function ItemActions({ product }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const [actions, setActions] = useState([]);

  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;

  useLiveData(`product-transitions`);
  const {
    subscriptions: { productTransitions: _productTransitions },
  } = useCache({
    productTransitions: (q) =>
      q.findRelatedRecords({ type: 'product', id: product.id }, 'productTransitions'),
  });
  const [productTransitions] = useDebounce(_productTransitions, 500);

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
  }, [productRemoteId, actions.length === 0, productTransitions]);

  const invokeAction = useCallback(
    async (actionName: string) => {
      let response = await post(`/api/products/${productRemoteId}/actions/${actionName}`);

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
        <TransitionDetails product={product} />
        <Dropdown.Item
          as={Link}
          to={`/products/${productRemoteId}/files`}
          className='capitalize'
          text={t('project.productFiles')}
        />
        <RequireRole roleName={ROLE.OrganizationAdmin}>
          <ProductProperties product={product} />
        </RequireRole>
      </Dropdown.Menu>
    </Dropdown>
  );
}
