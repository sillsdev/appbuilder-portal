import { visit, location } from '@bigtest/react';
import Convergence, { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import i18n from '@translations';

import app from './pages/app';

export { fakeAuth0Id } from './jwt';
export { useFakeAuthentication } from './auth';
export { setupRequestInterceptor } from './request-intercepting/polly';
export { respondWithJsonApi } from './request-intercepting/jsonapi';
export { setupApplicationTest, mountWithContext } from './mounting';

export { mockGet } from './request-intercepting/requests';

export function resetBrowser() {
  localStorage.clear();
  i18n.changeLanguage('en-US');
}

export function setupBrowser() {
  beforeEach(function() {
    resetBrowser();
  });

  afterEach(function() {
    resetBrowser();
  });
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export async function visitTheHomePage() {
  await visit('/');

  await when(() => assert(app.headers, 'expected headers to exist on the page'));
  await when(() =>
    assert(location().pathname === '/tasks', 'expected the page to be on the tasks page')
  );
}

export async function openOrgSwitcher() {
  if (!app.isSidebarVisible) {
    await app.openSidebar();
    await when(() => assert(app.isSidebarVisible, 'expected sidebar to be visible'));
  }

  if (!app.isOrgSwitcherVisible) {
    await app.openOrgSwitcher();
    await when(() => assert(app.isOrgSwitcherVisible, 'expected org switcher to be visible'));
  }
}

export async function switchToOrg(orgName: string) {
  await openOrgSwitcher();

  if (orgName.includes('All')) {
    await app.orgSwitcher.selectAllOrg();
  } else {
    await app.orgSwitcher.chooseOrganization(orgName);
  }

  await when(() => app.selectedOrg);
  expect(app.selectedOrg).to.equal(orgName);
}
