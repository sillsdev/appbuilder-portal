import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import { Dropdown, Modal } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';
import { useCurrentUser } from '@data/containers/with-current-user';
import CloseIcon from '@material-ui/icons/Close';
import moment from 'moment';

import { StoreResource, ProductResource, idFromRecordIdentity } from '~/data';

import { get } from '~/lib/fetch';
import ProductArtifact from './artifacts';

export interface IProps {
  product: ProductResource;
}
export default function ProductFiles({ product }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const store: StoreResource = dataStore.cache.query((q) => q.findRelatedRecord(product, 'store'));
  const [builds, setBuilds] = useState([]);
  const [fetchData, setFetchData] = useState(false);
  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;

  useEffect(() => {
    async function fetcher() {
      let response = await get(`/api/products/${productRemoteId}/builds`);
      try {
        let json = await response.json();

        let builds = json.data;
        setBuilds(builds || []);
      } catch (e) {
        console.debug('builds not ready, or do not exist');
      }
    }

    if (fetchData) {
      fetcher();
      setFetchData(false);
    }
  }, [productRemoteId, fetchData]);

  return (
    <Modal
      data-test-artifacats-modal
      onOpen={() => {
        setFetchData(true);
        console.log('DEBUG: setFectchData');
      }}
      trigger={
        <Dropdown.Item
          data-test-transition-details-button
          key='Details'
          text={t('project.products.popup.files')}
        />
      }
      closeIcon={<CloseIcon data-test-transition-details-close className='close-modal' />}
      className='large'
    >
      <Modal.Header>{t('project.products.transitions.productDetails')}</Modal.Header>
      <Modal.Content>
        <ProductArtifact key={product.id} product={product} productBuild={builds} />
      </Modal.Content>
    </Modal>
  );
}
