import * as React from 'react';
import { compose } from 'recompose';



import { withData, WithDataProps } from 'react-orbitjs';
import { NotificationAttributes, TYPE_NAME } from '@data/models/notification';

import { uuid } from '@orbit/utils';
import { Dropdown, Icon } from 'semantic-ui-react';

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

  //TODO: Remove this method when we collect tasks from the backend
  generateRandomTaks = async () => {
    await this.props.updateStore(t => [t.addRecord({
      type: TYPE_NAME,
      id: uuid(),
      attributes: {
        title: 'New Task',
        description: 'Chris Hubbard has requested approval for Sogdian Bible Public Domain.',
        time: new Date(Date.now() - 15000 * 60),
        link: '/tasks/1'
      }
    }),t.addRecord({
      type: TYPE_NAME,
      id: uuid(),
      attributes: {
        title: 'Another Task',
        description: 'Chris Hubbard approved your request.',
        time: new Date(Date.now() - 80000 * 60)     ,
        link: '/tasks/2'
      }
    })]);
  }

  componentWillMount() {
    this.generateRandomTaks();
  }

  render() {

    const { notifications } = this.props;

    return (
      <Dropdown
        data-test-header-notification
        className='notification-dropdown'
        pointing='top right'
        icon={null}
        trigger={
          <span>
            <Icon circular name='alarm' size='large' />
          </span>
        }
      >
        {
          notifications && notifications.length > 0 ?
            <Dropdown.Menu className='notifications'>
              {
                notifications.map((notification, index) => {

                  const { title, description, time } = notification.attributes;

                  return (
                    <Dropdown.Item key={index}>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </Dropdown.Item>
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