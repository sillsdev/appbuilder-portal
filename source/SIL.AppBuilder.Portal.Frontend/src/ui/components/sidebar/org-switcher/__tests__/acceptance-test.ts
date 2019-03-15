import { when } from '@bigtest/convergence';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import { setupApplicationTest, setupRequestInterceptor } from 'tests/helpers/index';
import app from 'tests/helpers/pages/app';

import scenarios, { threeOrgs, lotsOfOrgs, oneOrg } from './scenarios';
import switcher from './page';

import { isLoggedIn } from '~/lib/auth0';

async function visitRootPageAndOpenSidebar() {
  await visit('/');
  expect(isLoggedIn()).to.be.true;

  await when(() => expect(location().pathname).to.eq('/tasks'));

  await app.openSidebar();
  await when(() => expect(app.isSidebarVisible).to.be.true);
}

async function makeOrgSwitcherVisible() {
  await visitRootPageAndOpenSidebar();
  await app.openOrgSwitcher();
  await when(() => expect(app.isOrgSwitcherVisible).to.be.true);
}

describe('Acceptance | Organization Switcher', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('The Current user is a member of a single organization', () => {
    scenarios.userIsInOneOrganization();

    beforeEach(async () => {
      await visitRootPageAndOpenSidebar();
    });

    it('automatically selects the one organization', () => {
      expect(app.selectedOrg).to.eql(oneOrg[0].attributes.name);
    });

    describe('interacting with org switcher', () => {
      beforeEach(async () => {
        await app.openOrgSwitcher();
      });

      it.always('is disabled.', () => {
        expect(app.isOrgSwitcherVisible).to.be.false;
      });
    });
  });
  describe('The Current User is a member of multiple organizations', () => {
    scenarios.userIsIn3Organizations();

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [...threeOrgs],
      });
    });

    beforeEach(async () => {
      await makeOrgSwitcherVisible();
    });

    it('does not show the search field', () => {
      expect(switcher.isSearchVisible).to.be.false;
    });

    it('renders each organization by name', () => {
      const nodes = switcher.orgNames;
      const text = nodes.map((t) => t.innerText).join();

      expect(text).to.include('SIL International');
      expect(text).to.include('DeveloperTown');
      expect(text).to.include('Kalaam Media');
    });

    describe('Selecting an organization', () => {
      beforeEach(async () => {
        await switcher.selectOrg();
      });

      it('hides the org switcher', () => {
        // expect(switcher.selectedOrg).to.equal("SIL International");

        expect(app.isOrgSwitcherVisible).to.be.false;
      });

      it('visits the tasks page', () => {
        expect(location()).to.have.property('pathname', '/tasks');
      });
    });
  });

  describe('The current user is a member of lots of organizations', () => {
    scenarios.userIsInLotsOfOrganizations();

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [...lotsOfOrgs],
      });
    });

    beforeEach(async () => {
      await makeOrgSwitcherVisible();
    });

    it('shows the search field', () => {
      expect(switcher.isSearchVisible).to.be.true;
    });
  });
});
