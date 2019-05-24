import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom, attributesFor } from 'react-orbitjs';
import { Link } from 'react-router-dom';
import { uniqBy } from 'lodash';

import { useTranslations } from '~/lib/i18n';

import { useTimezoneFormatters } from '~/lib/hooks';

import { ProductResource } from '~/data';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { useUserTaskHelpers } from '~/data/containers/resources/user-task';

import { get as authenticatedGet } from '@lib/fetch';

import { handleResponse } from '~/data/containers/with-current-user/fetcher';

import { RectLoader } from '~/ui/components/loaders';

interface IProps {
  product: ProductResource;
}

export default function ProductTasksForCurrentUser({ product }: IProps) {
  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();
  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;
  const [ fetchComplete, setFetchComplete ] = useState(false);
  const [ transitions , setTransitions] = useState([]);

  useEffect(() => {
    async function fetcher() {
      let response = await authenticatedGet(`/api/products/${productRemoteId}/transitions/active`);
      try {
        let json = await handleResponse(response, t);
        let data = json.data;
        console.log("***** data:", data);
        setTransitions([data]);
        setFetchComplete(true);
        console.log("***** Set Fetch complete");
      } catch (e) {
        console.debug('***** actions not ready, or do not exist');
        setFetchComplete(true);
      }
    }
    console.log("***** In use effect");
    fetcher();
    console.log("***** after fetcher call");
  }, [productRemoteId]);

  let tasks = [];

  try {
    tasks = dataStore.cache.query((q) =>
      q
        .findRecords('userTask')
        .filter({ relation: 'product', record: product })
        .filter({ relation: 'user', record: currentUser })
    );

    // for some reason the backend is sending task creations to the frontend qucik
    // enough where the key-checking mechanisms hasn't yet added the first task,
    // so a subsequent task will become a duplicate because both received tasks
    // have yet to be added to the local cache.
    tasks = uniqBy(tasks, (task) => (task.keys || {}).remoteId);
  } catch (e) {
    console.debug(
      'error occurred',
      e,
      'we probably need to PR to orbit.js, as this is a race condition scenario that causes the error',
      'variables that are in use that may be related to this error: ',
      ['product: ', product, 'currentUser: ', currentUser]
    );
  }

  const { relativeTimeAgo } = useTimezoneFormatters();
  const { pathToWorkflow } = useUserTaskHelpers();

  if ( fetchComplete == false) {
    return <div className='w-100 p-sm p-b-md m-l-md fs-13'><RectLoader /></div>;
  }
  if (transitions.length === 0) {
    return <div className='w-100 p-sm p-b-md m-l-md fs-13'>{t('tasks.noTasksTitle')}</div>;
  }
  console.log("before return");
  return (
    <div className='w-100 p-sm p-b-md m-l-md fs-13'>
      {transitions.map((transition) => {
        // TODO: activityName will probably need to be translated
        //       need to sync on names of those, or a strategy of how to translate.
        const attributes = transition.attributes;
        console.log("*****Attributes:", attributes);
        let allowedNames = attributes["allowed-user-names"];
        if (!allowedNames) {
          allowedNames = t('tasks.scriptoria');
        }
        let activityName = attributes["initial-state"];
        let dateTransition = attributes["date-transition"];
        // NOTE: without this check, we can enter a race condition where a product is removed
        //       from the store, but the task still exists.
        if (tasks.length === 0) {
          let waitTime = "";
          if (dateTransition) {
            waitTime = relativeTimeAgo(dateTransition);
          }
          return (
            <div key={transition.id}>
              <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
              {t('tasks.forYou', { allowedNames, activityName })}
            </div>
          );
        } else {
          const task = tasks[0];
          const { dateCreated } = attributesFor(task);
          const waitTime = relativeTimeAgo(dateCreated);
          return (
              <div key={transition.id}>
              <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
              {t('tasks.forYou', { allowedNames, activityName })}
              <Link className='m-l-md bold uppercase' to={pathToWorkflow(task)}>
                {t('common.continue')}
              </Link>
            </div>
          );
        };
      })}
    </div>
  );
}
