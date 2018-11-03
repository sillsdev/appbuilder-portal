
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers/index';
import { openOrgSwitcher } from 'tests/helpers';
import { applicationTypesData } from 'tests/helpers/fixtures';
import i18n from '@translations/index';

import app from 'tests/helpers/pages/app';
import page from './page';

import {
  userInTwoOrganizationsButOnlyOneGroup,
  userInTwoOrganizationsAndNoGroups
} from './scenarios';

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
    this.mockGet(200, 'application-types', { data: applicationTypesData });
  });

  describe('the user does not have an organization selected', () => {
    userInTwoOrganizationsAndNoGroups();

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
      userInTwoOrganizationsAndNoGroups();

      beforeEach(async function() {
        await newProjectWithSelectedOrg('DeveloperTown');
      });

      it('redirects away', () => {
        expect(location().pathname).to.not.eq('/projects/new');
        expect(location().pathname).to.eq('/tasks');
      });
    });

    describe('the user is in one group', () => {
      userInTwoOrganizationsButOnlyOneGroup();

      beforeEach(async function() {
        await newProjectWithSelectedOrg('SIL');
      });

      it('selects a group for you', () => {
        expect(page.groupSelect.selectedGroup).to.equal('Group 1');
      });

      describe('the user changes the organization to one without groups', () => {
        beforeEach(async function() {
          await newProjectWithSelectedOrg('DeveloperTown');
        });

        it('shows the no groups message', () => {
          const expected = i18n.t('project.noAvailableGroups');
          const actual = page.noAvailableGroupsText;

          expect(actual).to.equal(expected);
        });

        it('has disabled the group select field', () => {
          const actual = page.groupSelect.isDisabled;

          expect(actual).to.be.true;
        });

        describe('the user changes the organization back', () => {
          beforeEach(async function() {
            await newProjectWithSelectedOrg('SIL');
          });

          it('selects a group for you', () => {
            expect(page.groupSelect.selectedGroup).to.equal('Group 1');
          });

          it('has disabled the group select field', () => {
            const actual = page.groupSelect.isDisabled;

            expect(actual).to.be.true;
          });
        });
      });
    });
  });
});
