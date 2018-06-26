import {
  interactor,
  clickable,
  hasClass,
  isPresent
} from '@bigtest/interactor';

@interactor
export class Header {

  constructor(selector?: string) { }

  isHeaderPresent = isPresent('[data-test-header-menu]');
  isAppNamePresent = isPresent('[data-test-header-appname]');
  isAddProjectButtonPresent = isPresent('[data-test-header-addproject]');
  isNotificationDropdownPresent = isPresent('[data-test-header-notification]');
  isAvatarDropdownPresent = isPresent('[data-test-header-avatar]');

  clickAddProject = clickable('[data-test-header-addproject]');
  clickNotification = clickable('[data-test-header-notification]');
  clickAvatar = clickable('[data-test-header-avatar]');

  isNotificationMenuOpen = isPresent('[data-test-header-notification].active');
  isAvatarMenuOpen = isPresent('[data-test-header-avatar].active');

}

export default new Header(`[data-test-header-menu]`);
