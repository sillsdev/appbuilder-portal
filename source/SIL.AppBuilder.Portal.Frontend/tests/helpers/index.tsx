import { visit, location } from '@bigtest/react';
import Convergence, { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import app from './pages/app';

export { fakeAuth0Id } from './jwt';
export { useFakeAuthentication } from './auth';
export { setupRequestInterceptor } from './request-intercepting/polly';
export { respondWithJsonApi } from './request-intercepting/jsonapi';
export { setupApplicationTest, mountWithContext } from './mounting';

export { mockGet } from './request-intercepting/requests';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export async function visitTheHomePage() {
  await visit('/');

  new Convergence()
    .when(() => app.headers)
    .do(() => expect(location().pathname).to.eq('/tasks'))
    .run();
}

export async function openOrgSwitcher() {
  await visit('/');

  if (!app.isSidebarVisible) {
    await app.openSidebar();
    await when(() => app.isSidebarVisible);
  }

  if (!app.isOrgSwitcherVisible) {
    await app.openOrgSwitcher();
    await when(() => app.isOrgSwitcherVisible);
  }
}


export async function switchToOrg(orgName: string) {
  await openOrgSwitcher();
  await app.orgSwitcher.chooseOrganization(orgName);
  await when(() => app.selectedOrg);

  expect(app.selectedOrg).to.equal(orgName);
}
