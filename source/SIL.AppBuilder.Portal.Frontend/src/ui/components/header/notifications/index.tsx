import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { withData, WithDataProps } from 'react-orbitjs';
import { NotificationAttributes, TYPE_NAME } from '@data/models/notification';

import { uuid } from '@orbit/utils';
import { Dropdown, Icon } from 'semantic-ui-react';

import './notification.scss';
import { withTimeAgo } from '@lib/with-time-ago';

interface Notification {
  type: string;
  id: string;
  attributes: NotificationAttributes;
}

export interface Props {
  notifications: Notification[];
  timeAgo: any;
}

export type IProps =
  & Props
  & WithDataProps
  & i18nProps;

class Notifications extends React.Component<IProps> {

  // TODO: Remove this method we are connected to the Backend
  generateRandomTaks = async () => {
    await this.props.updateStore(t => [
      t.addRecord({
        type: TYPE_NAME,
        id: uuid(),
        attributes: {
          title: 'New Task',
          description: 'Chris Hubbard has requested approval for Sogdian Bible Public Domain.',
          time: new Date(Date.now() - 15000 * 60),
          link: '/tasks/1',
          isViewed: false,
          show: true
        }
      }),
      t.addRecord({
        type: TYPE_NAME,
        id: uuid(),
        attributes: {
          title: 'Viewed Task',
          description: 'Chris Hubbard approved your request.',
          time: new Date(Date.now() - 80000 * 60)     ,
          link: '/tasks/2',
          isViewed: true,
          show: true
        }
      })
    ], { devOnly: true });
  }

  componentDidMount() {
    this.generateRandomTaks();
  }

  seenNotifications = () => {
    return this.props.notifications.reduce((memo,not) => memo && not.attributes.isViewed, true);
  }

  showNotifications = () => {
    return this.props.notifications.reduce((memo, not) => memo || not.attributes.show, false);
  }

  markNotificationToSeen = async () => {

    const { notifications } = this.props;

    await this.props.updateStore(t =>
      notifications.map(not => t.replaceAttribute({
        type: TYPE_NAME, id: not.id
      }, 'isViewed', true)),
      { devOnly: true });
  }

  clearAll = async (e) => {

    e.preventDefault();

    const { notifications } = this.props;

    await this.props.updateStore(t =>
      notifications.map(not => t.replaceAttribute({
        type: TYPE_NAME, id: not.id
      }, 'show', false)),
    { devOnly: true });
  }

  clearOne = async (id) => {
    await this.props.updateStore(t => t.removeRecord(
      { type: TYPE_NAME, id }
    ), { devOnly: true });
  }

  render() {

    const { t, timeAgo } = this.props;
    const { notifications } = this.props;
    const seenNotifications = this.seenNotifications();

    return (
      <Dropdown
        data-test-header-notification
        className='notifications-dropdown'
        pointing='top right'
        icon={null}
        onClose={this.markNotificationToSeen}
        trigger={
          <div>
            { !seenNotifications && <div className='red-dot' />}
            <Icon circular name='alarm' size='large' />
          </div>
        }
      >
        {
          notifications && notifications.length > 0 && this.showNotifications() ?
            <Dropdown.Menu className='notifications'>
              <div className='notification-buttons'>
                <a href='#' onClick={this.clearAll}>
                  {t('header.clearAll')}
                </a>
              </div>
              <div className={notifications.length > 3 ? 'scrollable-menu' : ''}>
                {
                  notifications.sort((a,b) => {

                    return (a.attributes.time === b.attributes.time) ? 0 :
                      a.attributes.time > b.attributes.time ? -1 : 1;

                  }).sort((a, b) => {

                    return (a.attributes.isViewed === b.attributes.isViewed) ? 0 :
                              a.attributes.isViewed ? 1 : -1;

                  }).map((notification, index) => {

                    const { title, description, time, isViewed } = notification.attributes;

                    if (!notification.attributes.show) {
                      return null;
                    }

                    return (
                      <div
                        className={`notification-item ${isViewed ? 'seen' : 'not-seen'}`}
                        key={index}
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <a className='close' href='#' onClick={e => {
                          e.preventDefault();
                          this.clearOne(notification.id);
                        }}>
                          <Icon name='close'/>
                        </a>
                        <h4 className='title'>{title}</h4>
                        <p className={!isViewed ? 'bold' : ''}>{description}</p>
                        <p className='time'>{timeAgo && timeAgo.format(time)}</p>
                      </div>
                    );
                  })
                }
              </div>
            </Dropdown.Menu> :
            <Dropdown.Menu>
              <div className='notification-no-data'>
                {t('header.emptyNotifications')}
              </div>
            </Dropdown.Menu>
        }
      </Dropdown>

    );
  }
}

const mapRecordsToProps = (ownProps) => {
  return {
    notifications: q => q.findRecords(TYPE_NAME)
  };
};

export default compose(
  withTimeAgo,
  withData(mapRecordsToProps),
  translate('translations')
)(Notifications);
