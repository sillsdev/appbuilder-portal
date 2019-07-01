import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import { Dropdown, Modal } from 'semantic-ui-react';
import { useTranslations } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
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
    console.log('getUserName:', workflowId);
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
    console.log('returnUserName', userName);
    return userName;
  };
  const getFormattedDate = (dateTransition: string) => {
    console.log('timezone: ', timezone);
    let formattedDate = '';
    if (dateTransition) {
      let momentTransition = moment.utc(dateTransition);
      formattedDate = !timezone
        ? momentTransition.local().format('L LT')
        : momentTransition.tz(timezone).format('L LT');
    }
    return formattedDate;
  };
  return (
    <Modal
      data-test-transitions-modal
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
        <div className='flex thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md gray-text bold'>
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
            const initialState = attributes['initial-state'];
            const comment = attributes['comment'];
            const command = attributes['command'];
            const workflowId = attributes['workflow-user-id'];
            const dateTransition = attributes['date-transition'];
            const allowedNames = attributes['allowed-user-names'];
            const remoteId = idFromRecordIdentity(transition);

            return (
              <div
                data-test-transition-details-record
                key={remoteId}
                className='artifact-item flex thin-bottom-border p-l-md p-t-sm p-b-sm p-r-md'
              >
                <div data-test-transition-state className='flex-25'>
                  <span>{initialState}</span>
                </div>
                <div data-test-transition-user className='flex-20'>
                  <span>{getUserName(workflowId, allowedNames, dateTransition)}</span>
                </div>
                <div data-test-transition-command className='flex-15'>
                  <span>{command}</span>
                </div>
                <div data-test-transition-comment className='flex-20'>
                  <span>{comment}</span>
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
