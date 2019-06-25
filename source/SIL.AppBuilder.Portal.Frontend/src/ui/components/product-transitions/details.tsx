import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import { Dropdown, Modal } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';
import { useCurrentUser } from '@data/containers/with-current-user';
import CloseIcon from '@material-ui/icons/Close';
import moment from 'moment';

import { idFromRecordIdentity } from '~/data';

import { get } from '~/lib/fetch';

export default function TransitionDetails({ product }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const [transitions, setTransitions] = useState([]);
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

    fetcher();
  }, [productRemoteId, transitions.length === 0]);

  const getUserName = (workflowId: string, allowedName: string, dateTransition: string) => {
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
    if (dateTransition != null) {
      let momentTransition = moment.utc(dateTransition);
      formattedDate =
        timezone === null
          ? momentTransition.local().format('L LT')
          : momentTransition.tz(timezone).format('L LT');
    }
    return formattedDate;
  };
  return (
    <Modal
      trigger={<Dropdown.Item key='Details' text={t('project.products.popup.details')} />}
      closeIcon={<CloseIcon className='close-modal' />}
      className='large'
    >
      <Modal.Header>{t('project.products.transitions.productDetails')}</Modal.Header>
      <Modal.Content>
        <div className='flex p-l-md p-t-sm p-b-sm p-r-md gray-text bold'>
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
        {transitions.map((transition) => {
          const attributes = attributesFor(transition);
          const initialState = attributes['initial-state'];
          const comment = attributes['comment'];
          const command = attributes['command'];
          const workflowId = attributes['workflow-user-id'];
          const dateTransition = attributes['date-transition'];
          const allowedNames = attributes['allowed-user-names'];
          const remoteId = idFromRecordIdentity(transition);
          return (
            <div key={remoteId} className='artifact-item flex p-l-md p-t-sm p-b-sm p-r-md'>
              <div className='flex-25'>
                <span>{initialState}</span>
              </div>
              <div className='flex-20'>
                <span>{getUserName(workflowId, allowedNames, dateTransition)}</span>
              </div>
              <div className='flex-15'>
                <span>{command}</span>
              </div>
              <div className='flex-20'>
                <span>{comment}</span>
              </div>
              <div className='flex-20'>
                <span>{getFormattedDate(dateTransition)}</span>
              </div>
            </div>
          );
        })}
      </Modal.Content>
    </Modal>
  );
}
