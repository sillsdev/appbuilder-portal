import { useOrbit } from 'react-orbitjs';

import { defaultOptions, NotificationResource } from '@data';

import { recordIdentityFromKeys } from '@data/store-helpers';

export interface IProvidedProps {
  clear: () => Promise<void>;
  markAsSeen: () => Promise<void>;
}

export function useDataActions(notification: NotificationResource) {
  const { dataStore } = useOrbit();
  if (!notification) return;

  const clear = async () => {
    await dataStore.update((t) => t.removeRecord(recordIdentityFromKeys(notification)), {
      ...defaultOptions(),
    });

    // TODO: this is an issue with remote ids not matching local ids.
    //       this probably means there is a bug in the sync strategies.
    //       we shouldn't need to manually remove the notification.
    dataStore.update((t) => t.removeRecord(notification), { skipRemote: true });
  };

  const markAsSeen = async () => {
    if (notification.attributes.dateRead !== null) {
      return;
    }

    const date = new Date().toISOString();

    await dataStore.update((t) => t.replaceAttribute(notification, 'dateRead', date), {
      ...defaultOptions(),
    });
  };

  return { clear, markAsSeen };
}
