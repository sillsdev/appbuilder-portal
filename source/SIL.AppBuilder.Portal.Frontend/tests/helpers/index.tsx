import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
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

  expect(location().pathname).to.eq('/tasks');
}

export async function openOrgSwitcher() {
  await visit('/');

  await app.openSidebar();
  expect(app.isSidebarVisible).to.be.true;

  await app.openOrgSwitcher();
  expect(app.isOrgSwitcherVisible).to.be.true;
}