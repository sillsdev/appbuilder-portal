import { NotificationResource } from '@data';

import { useLiveData } from '~/data/live';

export function useCollectionDataActions(notifications: NotificationResource[]) {
  const { pushData, dataStore } = useLiveData();

  const markAllAsViewed = () => {
    if (notifications.length === 0) {
      return;
    }

    const date = new Date().toISOString();

    pushData((t) =>
      notifications.map((notification) => {
        return t.replaceAttribute(notification, 'date-read', date);
      })
    );
  };

  const clearAll = async () => {
    if (notifications.length === 0) {
      return;
    }

    pushData((t) =>
      notifications.map((notification) => {
        return t.removeRecord(notification);
      })
    );

    // the backend doesn't return records in the operations payload when they are removed
    dataStore.update((t) => notifications.map((n) => t.removeRecord(n)), { skipRemote: true });
  };

  return { markAllAsViewed, clearAll };
}
