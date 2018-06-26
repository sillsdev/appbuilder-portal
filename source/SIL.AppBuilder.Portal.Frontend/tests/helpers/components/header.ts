import {
  interactor,
  clickable,
  hasClass
} from '@bigtest/interactor';

@interactor
export class Header {

  constructor(selector?: string) { }

  addProjectButtonClick = clickable('[data-test-header-addproject]');
  notificationDropdownClick = clickable('[data-test-header-notification]');
  avatarDropdownClick = clickable('[data-test-header-avatar]');

  notificationOpen = hasClass('[data-test-header-notification]','active visible');
  avatarOpen = hasClass('[data-test-header-avatar]','active visible');

}

export default new Header(`[data-test-header-menu]`);