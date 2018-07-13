import * as React from 'react';
import { compose } from 'recompose';

import { withData, WithDataProps } from 'react-orbitjs';
import { NotificationAttributes, TYPE_NAME } from '@data/models/notification';

import { uuid } from '@orbit/utils';
import { Dropdown, Icon } from 'semantic-ui-react';

import './notification.scss';

interface Notification {
  type: string,
  id: string,
  attributes: NotificationAttributes
}

export interface Props {
  notifications: Notification[]
}

export type IProps =
  & Props
  & WithDataProps

class Notifications extends React.Component<IProps> {

  //TODO: Remove this method we are connected to the Backend
  generateRandomTaks = async () => {
    await this.props.updateStore(t => [t.addRecord({
      type: TYPE_NAME,
      id: uuid(),
      attributes: {
        title: 'New Task',
        description: 'Chris Hubbard has requested approval for Sogdian Bible Public Domain.',
        time: new Date(Date.now() - 15000 * 60),
        link: '/tasks/1',
        isViewed: false
      }
    }),t.addRecord({
      type: TYPE_NAME,
      id: uuid(),
      attributes: {
        title: 'Another Task',
        description: 'Chris Hubbard approved your request.',
        time: new Date(Date.now() - 80000 * 60)     ,
        link: '/tasks/2',
        isViewed: false
      }
    })]);
  }

  componentWillMount() {
    this.generateRandomTaks();
  }

  seenNotifications = () => {
    return this.props.notifications.reduce((memo,not) => memo && not.attributes.isViewed, true);
  }

  markNotificationToSeen = () => {
    const { notifications } = this.props;

    this.props.updateStore(t =>
      notifications.map(not => t.replaceAttribute({
        type: TYPE_NAME, id: not.id
      }, 'isViewed', true ))
    )
  }

  render() {

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
            { !seenNotifications && <div className='red-dot'></div>}
            <Icon circular name='alarm' size='large' />
          </div>
        }
      >
        {
          notifications && notifications.length > 0 ?
            <Dropdown.Menu className='notifications'>
              <div className='notification-buttons'>
                <a href='#'>CLEAR ALL</a>
              </div>
            {
              notifications.map((notification, index) => {

                const { title, description, time } = notification.attributes;

                return (
                  <div className='notification-item' key={index}>
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                );
              })
            }
            </Dropdown.Menu> :
            <Dropdown.Menu className='notification-no-data'>
              <Dropdown.Item
                text='You have no notifications.' />
            </Dropdown.Menu>
        }
      </Dropdown>

    );
  }
}

const mapRecordsToProps = (ownProps) => {
  return {
    notifications: q => q.findRecords(TYPE_NAME)
  }
}

export default compose(
  withData(mapRecordsToProps)
)(Notifications)