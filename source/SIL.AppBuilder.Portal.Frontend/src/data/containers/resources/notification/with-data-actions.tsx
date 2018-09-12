import * as React from 'react';

import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultOptions, NotificationResource } from '@data';
import { compose } from 'recompose';
import { requireProps } from '@lib/debug';

interface IProvidedProps {
  clear: () => Promise<void>;
  markAsSeen: () => Promise<void>;
}

interface IOwnProps {
  notification: NotificationResource;
}

type IProps =
& IOwnProps
& WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class DataActionWrapper extends React.Component<IProps & T> {

    clear = async () => {
      const { dataStore, notification } = this.props;

      await dataStore.update(
        t => t.removeRecord(notification),
        { ...defaultOptions(), devOnly: true }
      );
    }

    markAsSeen = async () => {
      const { dataStore, notification } = this.props;

      await dataStore.update(
        t => t.replaceAttribute(notification, 'isViewed', true),
        { ...defaultOptions(), devOnly: true }
      );
    }


    render() {
      const dataProps = {
        clear: this.clear,
        markAsSeen: this.markAsSeen
      };

      return <WrappedComponent { ...dataProps } { ...this.props } />;
    }
  }

  return compose(
    withOrbit({}),
    requireProps('notification')
  )(DataActionWrapper);
}