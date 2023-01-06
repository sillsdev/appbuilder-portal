import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import { Dropdown, Modal } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';
import { useCurrentUser } from '@data/containers/with-current-user';
import CloseIcon from '@material-ui/icons/Close';
import moment from 'moment';

import TransitionComment from './comment';

import { StoreResource, ProductResource, idFromRecordIdentity } from '~/data';

import { get } from '~/lib/fetch';

export interface IProps {
  product: ProductResource;
}
export default function TransitionDetails({ product }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const store: StoreResource = dataStore.cache.query((q) => q.findRelatedRecord(product, 'store'));
  const [transitions, setTransitions] = useState([]);
  const [fetchData, setFetchData] = useState(false);
  const { currentUser } = useCurrentUser();
  const { timezone } = attributesFor(currentUser);
  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;

  useEffect(() => {
    async function fetcher() {
      let response = await get(`/api/products/${productRemoteId}/transitions`);
      try {
        let json = await response.json();

        let transitions = json.data;
        setTransitions(transitions || []);
      } catch (e) {
        console.debug('transitions not ready, or do not exist');
      }
    }

    if (fetchData) {
      fetcher();
      setFetchData(false);
    }
  }, [productRemoteId, fetchData]);

  const getUserName = (
    workflowId: string,
    allowedName: string,
    dateTransition: string,
    transitionType: number
  ) => {
    if (transitionType != 1 && transitionType != 5) {
      return '';
    }
    let userName = t('appName');
    if (dateTransition === null) {
      if (allowedName != null) {
        userName = allowedName;
      }
    } else {
      if (workflowId != null) {
        const users = dataStore.cache.query((q) =>
          q.findRecords('user').filter({ attribute: 'workflowUserId', value: workflowId })
        );
        if (users.length === 1) {
          const { name } = attributesFor(users[0]);
          userName = name;
        }
      }
    }
    return userName;
  };

  const getFormattedDate = (dateTransition: string) => {
    let formattedDate = '';
    if (dateTransition) {
      let momentTransition = moment.utc(dateTransition);
      formattedDate = !timezone
        ? momentTransition.local().format('L LT')
        : momentTransition.tz(timezone).format('L LT');
    }
    return formattedDate;
  };
  const getTransitionClass = (transitionType: number) => {
    let transitionClass = 'artifact-item flex thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md bold';
    if (transitionType === 1) {
      transitionClass = 'artifact-item flex thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md';
    } else if (transitionType === 5) {
      transitionClass = 'artifact-item flex thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md';
    }
    return transitionClass;
  };
  const getStateString = (transitionType: number, attributes) => {
    if (transitionType === 1) {
      const initialState = attributes['initial-state'];
      return initialState;
    }
    if (transitionType === 5) {
      const initialState = '★ ' + attributes['initial-state'];
      return initialState;
    }

    const workflowType: number = attributes['workflow-type'];
    const workflowTypeString = t(
      `admin.settings.workflowDefinitions.workflowTypes.${workflowType.toString()}`
    );
    const stateString = t(
      `project.products.transitions.transitionTypes.${transitionType.toString()}`,
      { workflowType: workflowTypeString }
    );
    return stateString;
  };
  const getStoreDescription = (store: StoreResource) => {
    let storeDescription = null;
    if (store) {
      const { description } = attributesFor(store);
      if (description) {
        storeDescription = description;
      }
    }
    return storeDescription;
  };
  return (
    <Modal
      data-test-transitions-modal
      onOpen={() => {
        setFetchData(true);
        console.log('DEBUG: setFectchData');
      }}
      trigger={
        <Dropdown.Item
          data-test-transition-details-button
          key='Details'
          text={t('project.products.popup.details')}
        />
      }
      closeIcon={<CloseIcon data-test-transition-details-close className='close-modal' />}
      className='large'
    >
      <Modal.Header>{t('project.products.transitions.productDetails')}</Modal.Header>
      <Modal.Content>
        <div data-test-product-store>
          <div className='thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md gray-text bold'>
            <span>{t('project.products.transitions.storeName')}</span>
          </div>
          <div data-test-product-store-name className='p-l-md p-t-sm p-b-sm p-r-md'>
            <span>{getStoreDescription(store)}</span>
          </div>
        </div>
        <div className='flex thin-bottom-border p-l-md p-t-md p-b-sm p-r-md gray-text bold'>
          <div className='flex-25'>
            <span>{t('project.products.transitions.state')}</span>
          </div>
          <div className='flex-20'>
            <span>{t('project.products.transitions.user')}</span>
          </div>
          <div className='flex-15'>
            <span>{t('project.products.transitions.command')}</span>
          </div>
          <div className='flex-20'>
            <span>{t('project.products.transitions.comment')}</span>
          </div>
          <div className='flex-20'>
            <span>{t('project.products.transitions.date')}</span>
          </div>
        </div>
        <div data-test-transition-details>
          {transitions.map((transition) => {
            const attributes = attributesFor(transition);
            const comment = attributes['comment'];
            const command = attributes['command'];
            const workflowId = attributes['workflow-user-id'];
            const dateTransition = attributes['date-transition'];
            const allowedNames = attributes['allowed-user-names'];
            const transitionType: number = attributes['transition-type'];
            const remoteId = idFromRecordIdentity(transition);

            return (
              <div
                data-test-transition-details-record
                key={remoteId}
                className={getTransitionClass(transitionType)}
              >
                <div data-test-transition-state className='flex-25'>
                  <span>{getStateString(transitionType, attributes)}</span>
                </div>
                <div data-test-transition-user className='flex-20'>
                  <span>
                    {getUserName(workflowId, allowedNames, dateTransition, transitionType)}
                  </span>
                </div>
                <div data-test-transition-command className='flex-15'>
                  <span>{command}</span>
                </div>
                <div data-test-transition-comment className='flex-20'>
                  <TransitionComment comment={comment} />
                </div>
                <div className='flex-20'>
                  <span>{getFormattedDate(dateTransition)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Content>
    </Modal>
  );
}
