import { useOrbit } from 'react-orbitjs';
import { defaultOptions, NotificationResource } from '@data';

import * as toast from '~/lib/toast';

export interface IProvidedProps {
  clear: () => Promise<void>;
  markAsSeen: () => Promise<void>;
}

export function useDataActions(notification: NotificationResource) {
  const { dataStore } = useOrbit();
  if (!notification) return;

  const clear = async () => {
    try {
      await dataStore.update((t) => t.removeRecord(notification), {
        ...defaultOptions(),
      });
    } catch (e) {
      // TODO: figure out why a DELETE and a PATCH happens here
      console.warn(e);
    }
  };

  const markAsSeen = async () => {
    if (notification.attributes.dateRead !== null) {
      return;
    }

    const date = new Date().toISOString();

    try {
      await dataStore.update((t) => t.replaceAttribute(notification, 'dateRead', date), {
        ...defaultOptions(),
      });
    } catch (e) {
      toast.error(e);
    }
  };

  return { clear, markAsSeen };
}
