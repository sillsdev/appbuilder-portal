
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers/index';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';


import page from './page';
import app from 'tests/helpers/pages/app';

async function openOrgSwitcher() {
  await visit('/');

  await app.openSidebar();
  await app.openOrgSwitcher();
}

async function newProjectWithSelectedOrg(orgName: string) {
  await openOrgSwitcher();
  await app.orgSwitcher.chooseOrganization(orgName);

  await visit('/projects/new');
}

describe('Acceptance | Project New | group select', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  beforeEach(function() {
    this.mockGet(200, 'users', { data: [] });
  });

  describe('the user does not have an organization selected', () => {
    useFakeAuthentication();

    beforeEach(async function() {
      await openOrgSwitcher();
      await app.orgSwitcher.selectAllOrg();

      await visit('/projects/new');
    });

    it('redirects them away from the form', () => {
      expect(location().pathname).to.not.eq('/projects/new');
      expect(location().pathname).to.eq('/tasks');
    });
  });

  describe('the user has an organization selected', () => {
    describe('the user is not in a group', () => {
      beforeEach(async function() {
        await newProjectWithSelectedOrg('DeveloperTown');
      });

      it('shows the no groups message', () => {

      });
    });

    describe('the user is in one group', () => {
      beforeEach(async function() {
        // TODO: stub data
        await newProjectWithSelectedOrg('SIL');
      });

      it('selects a group for you', () => {

      });

      describe('the user changes the organization to one without groups', () => {
        beforeEach(async function() {
          await newProjectWithSelectedOrg('DeveloperTown');
        });

        it('shows the no groups message', () => {

        });

        it('has disabled the group select field', () => {

        });

        describe('the user changes the organization back', () => {
          beforeEach(async function() {
            await newProjectWithSelectedOrg('SIL');
          });

          it('selects a group for you', () => {

          });

          it('has disabled the group select field', () => {

          });
        });
      });
    });
  });
});
