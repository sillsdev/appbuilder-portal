import {
  interactor,
  clickable,
  text,
  selectable,
  isPresent,
  Interactor
} from '@bigtest/interactor';

class App {
  headers = text('h1,h2,h3');

  clickNotificationsBell = clickable('[data-test-header-notification]');
  clickLogout = clickable('[data-test-header-menu] [data-test-logout]');

  selectLocale = selectable('[data-test-locale-switcher]');
  myProfileText = text('[data-test-header-avatar] [data-test-profile]');


  openSidebar = clickable('[data-test-header-sidebar-button]');
  isSidebarVisible = isPresent('.is-sidebar-visible [data-test-sidebar]');
  openOrgSwitcher = clickable('[data-test-org-switcher-toggler]');
  selectedOrg = text('[data-test-org-switcher-toggler]');

  isOrgSwitcherVisible = isPresent('[data-test-org-switcher]');

  isLoaderVisible = isPresent('.spinner');

  waitForDoneLoading = new Interactor('.spinner')
    .when<boolean>(spinner => {
      return !spinner;
    })
    .do(() => console.log('spinner gone'))
    .timeout(200);
}

export const AppInteractor = interactor(App);

export type TAppInteractor = App & Interactor;

export default new (AppInteractor as any)('[data-test-app-container]') as TAppInteractor;
