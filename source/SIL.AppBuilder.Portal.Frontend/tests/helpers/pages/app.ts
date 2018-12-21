import {
  interactor,
  clickable,
  text,
  selectable,
  scoped,
  isPresent,
  Interactor
} from '@bigtest/interactor';

import orgSwitcherInteractor from '@ui/components/sidebar/org-switcher/__tests__/page';

class App {
  orgSwitcher = orgSwitcherInteractor;

  headers = text('h1,h2,h3');

  toast = scoped('#notification-wrapper .toast-notification', {
    // NOTE: there is no way to tell if this is an error, or a success
    //       without checking the background color
    text: text('span'),
  });

  clickNotificationsBell = clickable('[data-test-header-notification]');
  clickLogout = clickable('[data-test-header-menu] [data-test-logout]');
  isLogoutPresent = isPresent('[data-test-header-menu] [data-test-logout]');

  selectLocale = selectable('[data-test-locale-switcher]');
  myProfileText = text('[data-test-header-avatar] [data-test-profile]');


  openSidebar = clickable('[data-test-header-sidebar-button]');
  isSidebarVisible = isPresent('.is-sidebar-visible [data-test-sidebar]');
  openOrgSwitcher = clickable('[data-test-org-switcher-toggler]');
  selectedOrg = text('[data-test-org-switcher-toggler]');

  isOrgSwitcherVisible = isPresent('[data-test-org-switcher]');
  isPaginationVisible = isPresent('[data-test-pagination-footer]');

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

export default new (AppInteractor as any)('#testing-root') as TAppInteractor;
