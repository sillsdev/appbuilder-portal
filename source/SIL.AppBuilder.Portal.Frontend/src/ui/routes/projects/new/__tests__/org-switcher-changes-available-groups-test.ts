import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers/index';
import { openOrgSwitcher, visitTheHomePage } from 'tests/helpers';
import { applicationTypesData } from 'tests/helpers/fixtures';
import i18n from '@translations/index';
import app from 'tests/helpers/pages/app';

import page from './page';
import {
  userInTwoOrganizationsButOnlyOneGroup,
  userInTwoOrganizationsAndNoGroups,
} from './scenarios';

async function newProjectWithSelectedOrg(orgName: string) {
  await openOrgSwitcher();

  await app.orgSwitcher.chooseOrganization(orgName);

  expect(location().pathname).to.eq('/tasks');

  await visit('/projects/new');
}

function setupMockData() {
  beforeEach(function() {
    this.mockGet(200, 'users', { data: [] });
    this.mockGet(200, 'application-types', { data: applicationTypesData });
    this.mockGet(200, 'groups?include=owner', {
      data: [
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Group 1' },
          relationships: {
            owner: { data: { id: 2, type: 'organizations' } },
          },
        },
      ],
      included: [
        {
          id: 2,
          type: 'organizations',
          attributes: { name: 'SIL' },
          relationships: {},
        },
      ],
    });
  });
}

describe('Acceptance | Project New | group select', () => {
  describe('the user does not have an organization selected', () => {
    userInTwoOrganizationsAndNoGroups();
    setupApplicationTest();
    setupMockData();

    beforeEach(async function() {
      await visitTheHomePage();
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
      setupApplicationTest();
      setupMockData();

      beforeEach(async function() {
        await visitTheHomePage();
        await newProjectWithSelectedOrg('DeveloperTown');
      });

      it('redirects away', () => {
        expect(location().pathname).to.not.eq('/projects/new');
        expect(location().pathname).to.eq('/tasks');
      });
    });

    describe('the user is in one group', () => {
      userInTwoOrganizationsButOnlyOneGroup();
      setupApplicationTest();
      setupMockData();

      beforeEach(async function() {
        await visitTheHomePage();
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
