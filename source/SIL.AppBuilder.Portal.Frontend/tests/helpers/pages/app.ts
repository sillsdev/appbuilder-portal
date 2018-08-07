import {
  interactor,
  clickable,
  text,
  selectable,
  isPresent
} from '@bigtest/interactor';

@interactor
export class AppInteractor {
  constructor(selector?: string) { }

  headers = text('h1,h2,h3');

  clickNotificationsBell = clickable('[data-test-header-notification]');
  clickLogout = clickable('[data-test-header-menu] [data-test-logout]');

  selectLocale = selectable('[data-test-locale-switcher]');
  myProfileText = text('[data-test-header-avatar] [data-test-profile]');
}

export default new AppInteractor('[data-test-app-container]');
