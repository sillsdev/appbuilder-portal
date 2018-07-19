import {
  interactor,
  clickable,
  hasClass,
  isPresent
} from '@bigtest/interactor';

@interactor
export class Header {

  constructor(selector?: string) { }

  clickAddProject = clickable('[data-test-header-addproject]');
  clickNotification = clickable('[data-test-header-notification]');
  clickAvatar = clickable('[data-test-header-avatar]');
  clickProfileLink = clickable('[data-test-profile]');
  clickSidebarButton = clickable('[data-test-header-sidebar-button]');

  isNotificationMenuOpen = isPresent('[data-test-header-notification] .menu.visible');
  isAvatarMenuOpen = isPresent('[data-test-header-avatar] .menu.visible');

}

export default new Header('[data-test-header-menu]');
