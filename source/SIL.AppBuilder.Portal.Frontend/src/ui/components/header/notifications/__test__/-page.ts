// tslint:disable:max-classes-per-file
import {
  interactor,
  scoped,
  clickable,
  isPresent,
  Interactor,
  text,
  hasClass,
  collection
} from '@bigtest/interactor';
import notifications from '..';

@interactor class NotificationRow{
  clear = clickable('[data-test-notification-close-one]');
  isUnread = hasClass('not-seen');
}

@interactor class NotificationMenu{
  clearAll = clickable('[data-test-clear-all]');
  notifications = collection('[data-test-notification]', NotificationRow);
}

@interactor class NotificationInteractor {
  static defaultScope = '[data-test-header-menu]';

  toggleNotificationMenu = clickable('[data-test-notification-trigger]');
  menu = scoped('.menu', NotificationMenu);

  hasUnreadNotificationsIndicator = isPresent('[data-test-notification-active=true]');

  get hasNotifications(){
    return this.notificationCount > 0;
  }
  get hasUnreadNotifications(){
    return this.hasNotifications && this.unreadNotificationCount > 0;
  }

  get notificationCount(this: Interactor) {
    return this.$$('[data-test-notification]').length;
  }
  get unreadNotificationCount(this: Interactor){
    return this.$$('[data-test-notification].not-seen').length;
  }
}

export type TNotificationInteractor = Notification & Interactor;

export default NotificationInteractor;
