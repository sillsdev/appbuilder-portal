import * as React from 'react';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as NOTIFICATION, NotificationAttributes } from '@data/models/notification';
import { query, defaultOptions, NOTIFICATIONS_TYPE, withLoader } from '@data';
import { withCollectionDataActions } from '@data/containers/resources/notification/with-collection-data-actions';

const mapNetworkToProps = (passedProps) => {
  return {
    notifications: [
      q => q
        .findRecords(NOTIFICATION)
        .sort('-time', '-isViewed'),
      { ...defaultOptions(), devOnly: true }
    ]
  };
};

const mapRecordsToProps = (passedProps) => {
  return {
    notifications: q => q
      .findRecords(NOTIFICATION)
      .sort('-time', '-isViewed'),
  };
};

export interface DataProps {
  notifications: Array<ResourceObject<NOTIFICATIONS_TYPE, NotificationAttributes>>;
  haveAllNotificationsBeenSeen: boolean;
  isThereAtLeastOneNotificationToShow: boolean;
}

export interface ActionProps {
  markAllAsViewed: () => void;
  clearAll: () => void;
  clearOne: (id: string) => void;
}

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<DataProps & WithDataProps> {
    haveAllNotificationsBeenSeen = () => {
      const { notifications } = this.props;

      return notifications &&
        notifications.reduce((memo, notification) => memo && notification.attributes.isViewed, true);
    }

    isThereAtLeastOneNotificationToShow = () => {
      const { notifications } = this.props;

      return notifications &&
        notifications.reduce((memo, notification) => memo || notification.attributes.show, false);
    }

    render() {
      const dataProps = {
        haveAllNotificationsBeenSeen: this.haveAllNotificationsBeenSeen(),
        isThereAtLeastOneNotificationToShow: this.isThereAtLeastOneNotificationToShow(),
      };

      return <WrappedComponent { ...this.props } {...dataProps} />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withLoader(({ notifications }) => !notifications),
    withCollectionDataActions,
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}