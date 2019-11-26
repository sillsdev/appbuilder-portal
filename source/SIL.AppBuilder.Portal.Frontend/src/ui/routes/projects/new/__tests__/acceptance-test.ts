import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers';

import page from './page';

const scenarios = {
  appWithSelectedOrg(orgId = '') {
    setupApplicationTest({ data: { currentOrganizationId: orgId } });
  },
  userHasNoGroups() {
    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { auth0Id: fakeAuth0Id },
        relationships: {
          ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
        },
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
      ],
    });
  },
  userHasGroups() {
    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { auth0Id: fakeAuth0Id },
        relationships: {
          ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
          ['group-memberships']: { data: [{ id: 1, type: 'group-memberships' }] },
        },
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          id: 1,
          type: 'group-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            group: { data: { id: 1, type: 'groups' } },
          },
        },
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Group 1' },
          relationships: {
            owner: { data: { id: 1, type: 'organizations' } },
          },
        },
      ],
    });
  },
  applicationTypes() {
    return {
      data: [
        {
          id: '1',
          type: 'application-types',
          attributes: {
            name: 'readingappbuilder',
            description: 'Scripture App Builder',
          },
        },
        {
          id: '2',
          type: 'application-types',
          attributes: {
            name: 'scriptureappbuilder',
            description: 'Reading App Builder',
          },
        },
      ],
      meta: {
        'total-records': 2,
      },
    };
  },
};

describe('Acceptance | New Project', () => {
  describe('the user has no groups', () => {
    scenarios.userHasNoGroups();
    scenarios.appWithSelectedOrg();

    describe('navigates to new project page', () => {
      beforeEach(async function() {
        await visit('/projects/new');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/tasks');
      });
    });
  });

  describe('the user has groups', () => {
    describe('but has all organizations selected', () => {
      //TODO: This test passes when run by itself but not with other tests
      //      Is there an issue with the testing framework or the scenarios?
      //      When debugging the issue (putting console.log messages in
      //      with-access-restrictions.tsx), I noticed the organizationId
      //      was set when it shouldn't be.
      scenarios.userHasGroups();
      scenarios.appWithSelectedOrg('');

      describe('navigates to the new project page', () => {
        beforeEach(async function() {
          await visit('/projects/new');
        });

        xit('is redirected', () => {
          expect(location().pathname).to.equal('/tasks');
        });
      });
    });

    describe('navigates to the new project page', () => {
      scenarios.userHasGroups();
      scenarios.appWithSelectedOrg('1');

      beforeEach(function() {
        this.mockGet(200, '/application-types', scenarios.applicationTypes());
        this.server.get('/assets/language/langtags.json').intercept((req, res) => {
          res.status(200);
          res.json([
            {
              tag: 'english',
              localname: 'english',
              region: 'US',
              names: ['American'],
            },
          ]);
        });
      });

      beforeEach(async function() {
        await visit('/projects/new');

        expect(location().pathname).to.equal('/projects/new');
      });

      it('has the save button disabled', () => {
        expect(page.isSaveDisabled).to.be.true;
      });

      describe('name is required', () => {
        beforeEach(async () => {
          await page.language.searchAndSelect('english');
          page.groupSelect.chooseGroup('Group 1');
          page.applicationTypeSelect.chooseApplicationType('Scripture App Builder');
        });

        it('has not enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.true;
        });
      });

      describe('group defaults to first option', () => {
        beforeEach(async function() {
          await page.fillName('some name');
          await page.language.searchAndSelect('english');
          await page.applicationTypeSelect.chooseApplicationType('Scripture App Builder');
        });

        it('has a value', () => {
          expect(page.groupSelect.selectedGroup).to.equal('Group 1');
        });

        it('has enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.false;
        });
      });

      describe('type defaults to first option', () => {
        beforeEach(async function() {
          await page.fillName('some name');
          await page.language.searchAndSelect('english');
          await page.groupSelect.chooseGroup('Group 1');
        });

        it('has a value', () => {
          expect(page.applicationTypeSelect.selectedApplicationType).to.equal(
            'Scripture App Builder'
          );
        });

        it('has enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.false;
        });
      });

      describe('language is required', () => {
        beforeEach(async function() {
          await page.fillName('some name');
          await page.groupSelect.chooseGroup('Group 1');
          await page.applicationTypeSelect.chooseApplicationType('Scripture App Builder');
        });

        it('has not enabled the save button', () => {
          expect(page.isSaveDisabled).to.be.true;
        });
      });

      describe('visibility is toggleable', () => {
        it('defaults to true / checked', () => {
          expect(page.isVisibilityChecked).to.be.true;
        });

        describe('is toggled', () => {
          beforeEach(async function() {
            await page.toggleVisibility();
          });

          it('is now unchecked', () => {
            expect(page.isVisibilityChecked).to.be.false;
          });
        });
      });
    });
  });
});
