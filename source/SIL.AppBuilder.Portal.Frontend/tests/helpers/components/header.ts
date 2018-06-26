import {
  interactor, text,
  clickable,
  fillable, blurrable,
  isPresent, triggerable, find, is, scoped
} from '@bigtest/interactor';

@interactor
export class Header {

  constructor(selector?: string) { }

  addProjectButtonClick = clickable('[data-test-header-addproject]');
  notificationDropdownClick = clickable('[data-test-header-notification]');
  avatarDropdownClick = clickable('[data-test-header-avatar]');

}

export default new Header(`[data-test-header-menu]`);