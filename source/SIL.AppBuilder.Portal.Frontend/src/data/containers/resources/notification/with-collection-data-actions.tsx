import { NotificationResource } from '@data';

import { useLiveData } from '~/data/live';

import { useCallback } from 'react';

import { recordsThatStillExist } from '~/data/store-helpers';

import { attributesFor } from 'react-orbitjs';

export function useCollectionDataActions(notifications: NotificationResource[]) {
  const { pushData, dataStore } = useLiveData();

  const markAllAsViewed = useCallback(() => {
    let records = recordsThatStillExist(dataStore, notifications).filter((record) => {
      return !attributesFor(record).dateRead;
    });

    if (records.length === 0) {
      return;
    }

    const date = new Date().toISOString();

    pushData((t) =>
      records.map((notification) => {
        return t.replaceRecord({
          ...notification,
          attributes: {
            ...notification.attributes,
            dateRead: date,
          },
        });
      })
    );
  }, [dataStore, notifications, pushData]);

  const clearAll = useCallback(async () => {
    let records = recordsThatStillExist(dataStore, notifications);

    if (records.length === 0) {
      return;
    }

    pushData((t) =>
      records.map((notification) => {
        return t.removeRecord(notification);
      })
    );

    // the backend doesn't return records in the operations payload when they are removed
    dataStore.update((t) => records.map((n) => t.removeRecord(n)), { skipRemote: true });
  }, [dataStore, notifications, pushData]);

  return { markAllAsViewed, clearAll };
}
