import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { TYPE_NAME as NOTIFICATION, NotificationAttributes } from '@data/models/notification';
import { query, defaultOptions } from '@data';
import { withStubbedDevData } from '@data/with-stubbed-dev-data';

// TODO: Use this map when API is ready
// const mapNetworkToProps = (passedProps) => {
//   return {
//     notifications: q => q.findRecords(NOTIFICATION)
//   };
// };

const mapRecordsToProps = (passedProps) => {
  return {
    notifications: q => q.findRecords(NOTIFICATION)
  };
};

export interface DataProps {
  notifications: Array<JSONAPI<NotificationAttributes>>;
  haveAllNotificationsBeenSeen: boolean;
  isThereAtLeastOneNotificationToShow: boolean;
}

export interface ActionProps {
  markNotificationsToSeen: () => void;
  clearAll: () => void;
  clearOne: (id: string) => void;
  markNotificationToSeen: (notification: JSONAPI<NotificationAttributes>) => void;
}

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<DataProps & WithDataProps> {

    markNotificationsToSeen = async () => {

      const { notifications } = this.props;

      await this.props.updateStore(t =>
        notifications.map(not => t.replaceAttribute({
          type: NOTIFICATION, id: not.id
        }, 'isViewed', true)),
        { ...defaultOptions(), devOnly: true });
    }

    markNotificationToSeen = async (notification) => {
      await this.props.updateStore(t => t.replaceAttribute({
        type: NOTIFICATION, id: notification.id
      }, 'isViewed', true), { ...defaultOptions(), devOnly: true });
    }

    clearAll = async () => {

      const { notifications } = this.props;

      await this.props.updateStore(t =>
        notifications.map(notification => t.removeRecord({
          type: NOTIFICATION, id: notification.id
        })),
        { ...defaultOptions(), devOnly: true });
    }

    clearOne = async (id) => {
      await this.props.updateStore(t => t.removeRecord(
        { type: NOTIFICATION, id }
      ), { ...defaultOptions(), devOnly: true });
    }

    haveAllNotificationsBeenSeen = () => {
      return this.props.notifications &&
        this.props.notifications.reduce((memo, not) => memo && not.attributes.isViewed, true);
    }

    isThereAtLeastOneNotificationToShow = () => {
      return this.props.notifications &&
        this.props.notifications.reduce((memo, not) => memo || not.attributes.show, false);
    }

    sortNotifications = (notifications) => {

      if (!notifications) {
        return [];
      }

      return notifications.sort((a, b) => {

        return (a.attributes.time === b.attributes.time) ? 0 :
          a.attributes.time > b.attributes.time ? -1 : 1;

      }).sort((a, b) => {

        return (a.attributes.isViewed === b.attributes.isViewed) ? 0 :
          a.attributes.isViewed ? 1 : -1;

      });
    }


    render() {

      const { notifications, ...otherProps } = this.props;

      const dataProps = {
        notifications: this.sortNotifications(notifications), // When API endpoint ready we should add query result here
        haveAllNotificationsBeenSeen: this.haveAllNotificationsBeenSeen(),
        isThereAtLeastOneNotificationToShow: this.isThereAtLeastOneNotificationToShow(),
      };

      const actionProps = {
        markNotificationsToSeen: this.markNotificationsToSeen,
        clearAll: this.clearAll,
        clearOne: this.clearOne
      };

      return <WrappedComponent {...otherProps} {...dataProps} {...actionProps} />;

    }

  }

  return compose(
    // query(mapNetworkToProps),
    withStubbedDevData('notification', 1, {
      title: 'New Task',
      description: 'Chris Hubbard has requested approval for Sogdian Bible Public Domain.',
      time: new Date(Date.now() - 15000 * 60),
      link: '/tasks/1',
      isViewed: false,
      show: true
    }),
    withStubbedDevData('notification', 2, {
      title: 'Viewed Task',
      description: 'Chris Hubbard approved your request.',
      time: new Date(Date.now() - 80000 * 60),
      link: '/tasks/2',
      isViewed: true,
      show: true
    }),
    withOrbit(mapRecordsToProps)
  )(DataWrapper);
}