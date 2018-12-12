import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultOptions, NotificationResource } from '@data';
import { TYPE_NAME as NOTIFICATION } from '@data/models/notification';
import { recordIdentityFromKeys } from '@data/store-helpers';
import { requireProps } from '@lib/debug';


interface IProvidedProps {
  markAllAsViewed: () => Promise<void>;
  clearAll: () => Promise<void>;
}

interface IOwnProps {
  notifications: NotificationResource[];
}

type IProps =
& IOwnProps
& WithDataProps;

export function withCollectionDataActions<T>(WrappedComponent) {
  class CollectionDataActionWrapper extends React.Component<IProps & T> {
    // clear count is a cache buster for any cache querying
    // for subsequent higher-order-components
    state = { clearCount: 0 };

    markAllAsViewed = async () => {
      const { notifications, dataStore } = this.props;
      const date = new Date().toISOString();
      await dataStore.update(t =>
        notifications.map(notification => t.replaceAttribute(notification, 'dateRead', date)),
        { ...defaultOptions() });
    }

    clearAll = async () => {
      const { notifications, dataStore } = this.props;

      await dataStore.update(
        t => {
          const operations = notifications
            .map(notification => t.removeRecord(recordIdentityFromKeys(notification)));

          return operations;
        },
        { ...defaultOptions(), devOnly: true }
      );

      this.setState({ clearCount: this.state.clearCount + 1 });
    }

    render() {
      const dataProps = {
        markAllAsViewed: this.markAllAsViewed,
        clearAll: this.clearAll,
        clearRound: this.state.clearCount
      };

      return <WrappedComponent { ...dataProps } { ...this.props } />;
    }
  }

  return compose(
    withOrbit({}),
    requireProps('notifications')
  )(CollectionDataActionWrapper);
}
