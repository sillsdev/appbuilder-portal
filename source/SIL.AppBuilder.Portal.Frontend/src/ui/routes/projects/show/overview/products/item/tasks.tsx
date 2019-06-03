import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [fetchComplete, setFetchComplete] = useState(false);
  const [transition, setTransition] = useState();

  useEffect(() => {
    async function fetcher() {
      let response = await authenticatedGet(`/api/products/${productRemoteId}/transitions/active`);
      try {
        let json = await handleResponse(response, t);
        let data = json.data;
        setTransition(data);
        setFetchComplete(true);
      } catch (e) {
        setFetchComplete(true);
      }
    }
    fetcher();
  }, [productRemoteId]);

  const { relativeTimeAgo } = useTimezoneFormatters();
  const { pathToWorkflow } = useUserTaskHelpers();
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
          const taskUserId = remoteIdentityFrom(dataStore, user).keys.remoteId;
          const currentUserId = remoteIdentityFrom(dataStore, currentUser).keys.remoteId;

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
  const formatTaskLine = (transition) => {
    // TODO: activityName will probably need to be translated
    //       need to sync on names of those, or a strategy of how to translate.
    const attributes = transition.attributes;
    let allowedNames = attributes['allowed-user-names'];
    if (!allowedNames) {
      allowedNames = t('tasks.scriptoria');
    }
    const activityName = attributes['initial-state'];
    let waitTime = '';
    // Tasks assigned to the system don't have a user task
    // They will get their wait time from the current transition record
    if (task) {
      const { dateCreated } = attributesFor(task);
      waitTime = relativeTimeAgo(dateCreated);
      // NOTE: without this check, we can enter a race condition where a product is removed
      //       from the store, but the task still exists.
      const taskProduct = dataStore.cache.query((q) => q.findRelatedRecord(task, 'product'));
      if (!taskProduct) return 'Task has no product!';
    } else {
      const dateTransition = attributes['date-started'];
      if (dateTransition) {
        waitTime = relativeTimeAgo(dateTransition);
      }
    }
    if (currentUserTask) {
      return (
        <div key={transition.id}>
          <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
          {t('tasks.forNames', { allowedNames, activityName })}
          <Link className='m-l-md bold uppercase' to={pathToWorkflow(task)}>
            {t('common.continue')}
          </Link>
        </div>
      );
    } else {
      return (
        <div key={transition.id}>
          <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
          {t('tasks.forNames', { allowedNames, activityName })}
        </div>
      );
    }
  };
  const [currentUserTask, task] = useMemo(getCurrentUserTask, [product, currentUser]);
  if (fetchComplete == false) {
    return (
      <div className='w-100 p-sm p-b-md m-l-md fs-13'>
        <RectLoader />
      </div>
    );
  }
  // No transitions means no builds or publishes in progress
  // Don't display anything in this case.
  if (!transition) {
    return '';
  }
  const format = formatTaskLine(transition);
  return <div className='w-100 p-sm p-b-md m-l-md fs-13'>{format}</div>;
}
