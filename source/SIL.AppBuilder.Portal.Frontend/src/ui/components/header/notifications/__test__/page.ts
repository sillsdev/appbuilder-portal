import {
  interactor,
  clickable,
  isPresent,
  Interactor
} from '@bigtest/interactor';

class Notification {

  constructor(selector?: string) { }

  clickNotification = clickable('[data-test-notification-trigger]');
  isNotificationMenuOpen = isPresent('[data-test-header-notification] .menu.visible');

  clickClearAll = clickable('[data-test-clear-all]');

  clickCloseIndividualNotification = clickable('[data-test-notification-close-one]');

  hasNotifications = isPresent('[data-test-notification]');

  countNotifications(this: Interactor) {
    return this.$$('[data-test-notification').length;
  }
}

export const NotificationInteractor = interactor(Notification);

export type TNotificationInteractor = Notification & Interactor;

export default new (NotificationInteractor as any)('[data-test-header-menu]') as TNotificationInteractor;