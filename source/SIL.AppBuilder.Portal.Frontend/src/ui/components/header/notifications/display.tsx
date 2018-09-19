import * as React from 'react';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import NotificationIcon from '@material-ui/icons/Notifications';
import NotificationActiveIcon from '@material-ui/icons/NotificationsActive';

import { DataProps, ActionProps } from './data';

import Row from './row';

export type IProps =
  & DataProps
  & ActionProps
  & i18nProps;

class Notifications extends React.Component<IProps> {

  state = {
    visible: false
  };

  toggle = () => {
    const { markAllAsViewed } = this.props;
    if (this.state.visible) {
      markAllAsViewed();
    }
    this.setState({
      visible: !this.state.visible
    });
  }

  clearAll = (e) => {
    const { clearAll } = this.props;

    e.preventDefault();

    clearAll();
  }

  render() {
    const { t } = this.props;

    const {
      notifications,
      haveAllNotificationsBeenSeen,
      isThereAtLeastOneNotificationToShow
    } = this.props;

    const hasNotifications = notifications &&
      notifications.length > 0 && isThereAtLeastOneNotificationToShow;

    const isMenuVisible = this.state.visible ? 'visible' : '';

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
          {haveAllNotificationsBeenSeen ? <NotificationIcon /> : <NotificationActiveIcon /> }
        </div>

        <div className={`ui menu transition notifications ${isMenuVisible}`}>

          { hasNotifications && (
            <>
              <div className="notification-buttons">
                <a href="#"
                  data-test-clear-all
                  onClick={this.clearAll}
                >
                  {t('header.clearAll') }
                </a>
              </div>

              <div className={notifications.length > 3 ? 'scrollable-menu' : ''}>
                { notifications.map(notification => (
                    <Row key={notification.id} notification={notification} />
                ))}
              </div>
            </>
          )}

          { !hasNotifications && (
            <div className='notification-no-data'>
              {t('header.emptyNotifications')}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Notifications;
