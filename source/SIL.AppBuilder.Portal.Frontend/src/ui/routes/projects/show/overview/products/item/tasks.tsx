import React, { useState, useCallback } from 'react';
import { useOrbit, attributesFor } from 'react-orbitjs';
import Store from '@orbit/store';
import { Link } from 'react-router-dom';
import { uniqBy } from 'lodash';

import { useTranslations } from '~/lib/i18n';

import { useTimezoneFormatters } from '~/lib/hooks';

import { ProductResource, idFromRecordIdentity } from '~/data';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { useUserTaskHelpers } from '~/data/containers/resources/user-task';

import { get as authenticatedGet } from '@lib/fetch';

import { handleResponse } from '~/data/containers/with-current-user/fetcher';

import { AsyncWaiter } from '~/data/async-waiter';

interface IProps {
  product: ProductResource;
}

export default function ProductTasksForCurrentUser({ product }: IProps) {
  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();
  const productRemoteId = idFromRecordIdentity(product as any);
  const { relativeTimeAgo } = useTimezoneFormatters();
  const { pathToWorkflow } = useUserTaskHelpers();
  const [transition, setTransition] = useState(null);
  const getTransition = useCallback(async () => {
    let transition = null;
    let response = await authenticatedGet(`/api/products/${productRemoteId}/transitions/active`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      },
    });
    try {
      let json = await handleResponse(response, t);
      transition = json.data;
    } catch (e) {
      console.debug('error occurred on handling transition response');
    }
    return transition;
  }, [dataStore, productRemoteId]);
  const useTransitions = () => {
    return getTransition();
  };
  const getWaitTime = (attributes, task, relativeTimeAgo, dataStore: Store) => {
    let waitTime = '';
    // Get wait time from user task if it exists, otherwise compute from transition
    if (task) {
      const { dateCreated } = attributesFor(task);
      waitTime = relativeTimeAgo(dateCreated);
      // NOTE: without this check, we can enter a race condition where a product is removed
      //       from the store, but the task still exists.
      const taskProduct = dataStore.cache.query((q) => q.findRelatedRecord(task, 'product'));
      if (!taskProduct) {
        return 'Task has no product!';
      }
    } else {
      const dateTransition = attributes['date-started'];
      if (dateTransition) {
        waitTime = relativeTimeAgo(dateTransition);
      }
    }
    return waitTime;
  };
  // Get current user task is a hook function called by UseMemo
  const getCurrentUserTask = () => {
    let tasks = [];
    try {
      tasks = dataStore.cache.query((q) =>
        q.findRecords('userTask').filter({ relation: 'product', record: product })
      );
      // for some reason the backend is sending task creations to the frontend qucik
      // enough where the key-checking mechanisms hasn't yet added the first task,
      // so a subsequent task will become a duplicate because both received tasks
      // have yet to be added to the local cache.
      tasks = uniqBy(tasks, (task) => (task.keys || {}).remoteId);
      let foundCurrentUser = false;
      let workTask = null;
      {
        tasks.map((task) => {
          const user = dataStore.cache.query((q) => q.findRelatedRecord(task, 'user'));
          const taskUserId = idFromRecordIdentity(user as any);
          const currentUserId = idFromRecordIdentity(currentUser as any);

          if (taskUserId === currentUserId) {
            foundCurrentUser = true;
            workTask = task;
          } else if (!workTask) {
            // If there isn't a return task set, set it to this entry so that an elapsed time
            // can be calculated, even if there isn't one for the current user.
            workTask = task;
          }
        });
      }
      return [foundCurrentUser, workTask];
    } catch (e) {
      console.debug(
        'error occurred',
        e,
        'we probably need to PR to orbit.js, as this is a race condition scenario that causes the error',
        'variables that are in use that may be related to this error: ',
        ['product: ', product, 'currentUser: ', currentUser]
      );
    }
  };

  const getAllowedNames = (attributes) => {
    let allowedNames = attributes['allowed-user-names'];
    if (!allowedNames) {
      allowedNames = t('tasks.scriptoria');
    }
    return allowedNames;
  };

  return (
    <div className='w-100 p-sm p-b-md m-l-md fs-13'>
      <AsyncWaiter fn={useTransitions}>
        {({ value }) => {
          setTransition(value);
          let waitTime = '';
          let allowedNames = '';
          let activityName = '';
          let [foundCurrentUserTask, task] = getCurrentUserTask();
          if (transition) {
            const attributes = attributesFor(transition);
            activityName = attributes['initial-state'];
            allowedNames = getAllowedNames(attributes);
            waitTime = getWaitTime(attributes, task, relativeTimeAgo, dataStore);
          }
          return (
            <div>
              {transition && (
                <div key={transition.id}>
                  <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
                  {t('tasks.forNames', { allowedNames, activityName })}
                  {foundCurrentUserTask && (
                    <Link className='m-l-md bold uppercase' to={pathToWorkflow(task)}>
                      {t('common.continue')}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </AsyncWaiter>
    </div>
  );
}
