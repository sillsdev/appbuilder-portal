import * as React from 'react';
import { compose } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as NOTIFICATION, NotificationAttributes } from '@data/models/notification';
import { query, defaultOptions, NOTIFICATIONS_TYPE, withLoader } from '@data';
import { withCollectionDataActions } from '@data/containers/resources/notification/with-collection-data-actions';


const notificationsQuery = (q) => q.findRecords(NOTIFICATION).sort('-dateCreated', '-dateRead');

const mapNetworkToProps = (passedProps) => {
  return {
    notifications: [notificationsQuery, {...defaultOptions()}]
  };
};

const mapRecordsToProps = (passedProps) => {
  return {
    notifications: notificationsQuery,
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
        notifications.reduce((memo, notification) => memo && notification.attributes.dateRead !== null, true);
    }

    isThereAtLeastOneNotificationToShow = () => {
      const { notifications } = this.props;

      return notifications &&
        notifications.reduce((memo, notification) => memo || notification.attributes.show, false);
    }

    render() {
      const dataProps = {
        haveAllNotificationsBeenSeen: this.haveAllNotificationsBeenSeen(),
        isThereAtLeastOneNotificationToShow: true,
      };

      return <WrappedComponent { ...this.props } {...dataProps} />;
    }
  }

  return compose(
    query(mapNetworkToProps),
    withLoader(({ notifications }) => !notifications),
    withOrbit(mapRecordsToProps),
    withCollectionDataActions,
  )(DataWrapper);
}
