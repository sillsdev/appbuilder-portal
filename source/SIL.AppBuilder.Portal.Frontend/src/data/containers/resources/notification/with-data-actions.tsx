import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultOptions, NotificationResource } from '@data';

import { recordIdentityFromKeys } from '@data/store-helpers';
import { compose } from 'recompose';
import { requireProps } from '@lib/debug';

export interface IProvidedProps {
  clear: () => Promise<void>;
  markAsSeen: () => Promise<void>;
}

interface IOwnProps {
  notification: NotificationResource;
}

type IProps = IOwnProps & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class DataActionWrapper extends React.Component<IProps & T> {
    clear = async () => {
      const { dataStore, notification } = this.props;

      await dataStore.update((t) => t.removeRecord(recordIdentityFromKeys(notification)), {
        ...defaultOptions(),
      });
    };

    markAsSeen = async () => {
      const { dataStore, notification } = this.props;
      if (notification.attributes.dateRead !== null) {
        return;
      }

      const date = new Date().toISOString();

      await dataStore.update((t) => t.replaceAttribute(notification, 'dateRead', date), {
        ...defaultOptions(),
      });
    };

    render() {
      const dataProps = {
        clear: this.clear,
        markAsSeen: this.markAsSeen,
      };

      return <WrappedComponent {...dataProps} {...this.props} />;
    }
  }

  return compose(
    withOrbit({}),
    requireProps('notification')
  )(DataActionWrapper);
}
