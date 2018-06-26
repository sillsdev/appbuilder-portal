import {
  interactor,
  clickable,
  hasClass
} from '@bigtest/interactor';

@interactor
export class Header {

  constructor(selector?: string) { }

  clickAddProject = clickable('[data-test-header-addproject]');
  clickNotification = clickable('[data-test-header-notification]');
  clickAvatar = clickable('[data-test-header-avatar]');

  isNotificationMenuOpen = hasClass('[data-test-header-notification]','active');
  isAvatarMenuOpen = hasClass('[data-test-header-avatar]','active');

}

export default new Header(`[data-test-header-menu]`);