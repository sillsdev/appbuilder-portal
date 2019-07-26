import React, { useState, useCallback } from 'react';
import { useOrbit } from 'react-orbitjs';
import { uniqBy } from 'lodash';

import { ProductResource, TaskResource, idFromRecordIdentity } from '~/data';

import { useCurrentUser } from '~/data/containers/with-current-user';

interface IProvidedDataProps {
  foundCurrentUser: boolean;
  workTask: TaskResource;
}
interface INeededProps {
  product: ProductResource;
}

export function useCurrentUserTask({ product }: INeededProps): IProvidedDataProps {
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();
  const [foundCurrentUser, setFoundCurrentUser] = useState();
  const [workTask, setWorkTask] = useState();

  // Get current user task is a hook function called by UseMemo
  const getCurrentUserTask = useCallback(() => {
    let tasks = [];
    try {
      let localWorkTask = null;
      let localFoundCurrentUser = false;
      tasks = dataStore.cache.query((q) =>
        q.findRecords('userTask').filter({ relation: 'product', record: product })
      );
      // for some reason the backend is sending task creations to the frontend qucik
      // enough where the key-checking mechanisms hasn't yet added the first task,
      // so a subsequent task will become a duplicate because both received tasks
      // have yet to be added to the local cache.
      tasks = uniqBy(tasks, (task) => (task.keys || {}).remoteId);
      {
        tasks.map((task) => {
          const user = dataStore.cache.query((q) => q.findRelatedRecord(task, 'user'));
          const taskUserId = idFromRecordIdentity(user as any);
          const currentUserId = idFromRecordIdentity(currentUser as any);
          if (taskUserId === currentUserId) {
            localFoundCurrentUser = true;
            localWorkTask = task;
          } else if (!localWorkTask) {
            // If there isn't a return task set, set it to this entry so that an elapsed time
            // can be calculated, even if there isn't one for the current user.
            localWorkTask = task;
          }
        });
      }
      if (localFoundCurrentUser != foundCurrentUser) {
        setFoundCurrentUser(localFoundCurrentUser);
      }
      if (localWorkTask != workTask) {
        setWorkTask(localWorkTask);
      }
    } catch (e) {
      console.debug(
        'error occurred',
        e,
        'we probably need to PR to orbit.js, as this is a race condition scenario that causes the error',
        'variables that are in use that may be related to this error: ',
        ['product: ', product, 'currentUser: ', currentUser]
      );
    }
  }, [dataStore.cache, product, currentUser, workTask]);
  getCurrentUserTask();
  return { foundCurrentUser, workTask };
}
