import {
  interactor,
  clickable,
  text,
  isPresent
} from '@bigtest/interactor';

@interactor
export class AppInteractor {
  constructor(selector?: string) { }

  headers = text('h1');

  clickNotificationsBell = clickable('[data-test-header-notification]');
  clickLogout = clickable('[data-test-header-menu] [data-test-logout]');

}

export default new AppInteractor('[data-test-app-container]');
