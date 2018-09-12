import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import { withData, DataProps, ActionProps } from './data';

import { Icon } from 'semantic-ui-react';

import './notification.scss';

import { withTimeAgo } from '@lib/with-time-ago';


export interface Props {
  timeAgo: any;
}

export type IProps =
  & Props
  & DataProps
  & ActionProps
  & i18nProps;

class Notifications extends React.Component<IProps> {

  state = {
    visible: false
  };

  toggle = (e) => {

    const { markNotificationsToSeen } = this.props;

    if (this.state.visible) {
      markNotificationsToSeen();
    }

    this.setState({
      visible: !this.state.visible
    });
  }

  render() {

    const { t, timeAgo } = this.props;
    const { notifications, haveAllNotificationsBeenSeen, isThereAtLeastOneNotificationToShow } = this.props;
    const { clearAll, clearOne, markNotificationToSeen } = this.props;

    return (
      <div className='ui top right pointing dropdown' data-test-header-notification>
        <div
          style={{ zIndex: 1 }}
          className={`full-overlay transition ${this.state.visible ? 'visible invisible' : ''}`}
          onClick={this.toggle}/>

        <div
          data-test-notification-trigger
          style={{ position: 'relative' }}
          onClick={this.toggle}
        >
          {!haveAllNotificationsBeenSeen && <div className='red-dot' />}
          <i className='alarm large circular icon no-shadows' />
        </div>

        <div className={`ui menu transition notifications ${this.state.visible ? 'visible' : ''}`}>
          {
            notifications && notifications.length > 0 && isThereAtLeastOneNotificationToShow ?
            <>
              <div className="notification-buttons">
                <a href="#" 
                  data-test-clear-all
                  onClick={e => {
                    e.preventDefault();
                    clearAll();
                  }}
                >
                  {t('header.clearAll') }
                </a>
              </div>
              <div className={notifications.length > 3 ? 'scrollable-menu' : ''}>
                {
                  notifications.map((notification, index) => {

                    const { title, description, time, isViewed } = notification.attributes;
                    const viewState = isViewed ? 'seen' : 'not-seen';

                    if (!notification.attributes.show) {
                      return null;
                    }

                    return (
                      <div data-test-notification className={`notification-item ${viewState}`} key={notification.id} onClick={e => {
                        e.preventDefault();
                        markNotificationToSeen(notification);
                      }}>
                        <a data-test-notification-close-one className='close' href='#' onClick={e => {
                          e.preventDefault();
                          clearOne(notification.id);
                        }}>
                          <Icon name='close' />
                        </a>
                        <h4 className='title'>{title}</h4>
                        <p className={!isViewed ? 'bold' : ''}>{description}</p>
                        <p className='time'>{timeAgo && timeAgo.format(time)}</p>
                      </div>
                    );
                  })
                }
              </div>
            </> :
            <div className='notification-no-data'>
              {t('header.emptyNotifications')}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default compose(
  withTimeAgo,
  withData,
  translate('translations')
)(Notifications);
