import {
  interactor,
  clickable,
  hasClass,
  isPresent
} from '@bigtest/interactor';

@interactor
export class NotificationInteractor {

  constructor(selector?: string) { }

  clickNotification = clickable('[data-test-notification-trigger]');
  isNotificationMenuOpen = isPresent('[data-test-header-notification] .menu.visible');
  clickCloseIndividualNotification = clickable('[data-test-notification-close-one]');
  isIndividualNotificationPresent = isPresent('[data-test-notification]');
}

export default new NotificationInteractor('[data-test-header-menu]');