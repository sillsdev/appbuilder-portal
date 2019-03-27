import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
  resetBrowser,
} from 'tests/helpers';

import UserTableInteractor from './-user-table';

let userTable = null;

describe('Acceptance | User groups', () => {
  resetBrowser();

  describe('In users page', () => {
    useFakeAuthentication();
    setupApplicationTest();

    beforeEach(function() {
      this.mockGet(200, '/users', {
        data: [
          {
            type: 'users',
            id: 2,
            attributes: {
              name: 'Fake user',
            },
            relationships: {
              'group-memberships': {
                data: [
                  {
                    type: 'group-memberships',
                    id: 2,
                  },
                  {
                    type: 'group-memberships',
                    id: 3,
                  },
                ],
              },
              'organization-memberships': {
                data: [
                  {
                    type: 'organization-memberships',
                    id: 2,
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            type: 'organization-memberships',
            id: 2,
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              user: { data: { type: 'user', id: 2 } },
            },
          },
          {
            type: 'group-memberships',
            id: 2,
            relationships: {
              group: { data: { type: 'groups', id: 1 } },
              user: { data: { type: 'users', id: 2 } },
            },
          },
          {
            type: 'group-memberships',
            id: 3,
            relationships: {
              group: { data: { type: 'groups', id: 2 } },
              user: { data: { type: 'users', id: 2 } },
            },
          },
          {
            type: 'groups',
            id: 1,
            attributes: { name: 'Fake group', abbreviation: 'FG' },
            relationships: {
              owner: { data: { type: 'organizations', id: 1 } },
            },
          },
          {
            type: 'groups',
            id: 2,
            attributes: { name: 'Another Fake group', abbreviation: 'AFG' },
            relationships: {
              owner: { data: { type: 'organizations', id: 1 } },
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/users');
      userTable = new UserTableInteractor();
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    it('two groups are selected', () => {
      const text = userTable
        .row(0)
        .activeGroups()
        .map((g) => g.text)
        .join('');

      expect(text).to.not.include('None');
      expect(text).to.include('Fake group');
      expect(text).to.include('Another Fake group');
    });

    describe('remove user from all groups', () => {
      beforeEach(function() {
        this.mockDelete(204, 'group-memberships/2');
        this.mockDelete(204, 'group-memberships/3');
      });

      beforeEach(async function() {
        await userTable.groupDropdownCheckboxes(0).click();
        await userTable.groupDropdownCheckboxes(1).click();
      });

      it('None is displayed', () => {
        const text = userTable.groupDropdownText;

        expect(text).to.include('None');
        expect(text).to.not.include('Fake group');
        expect(text).to.not.include('Another Fake group');
      });

      describe('add one group back', () => {
        beforeEach(function() {
          this.mockPost(201, 'group-memberships', {
            data: {
              attributes: {},
              id: 2,
              type: 'group-memberships',
              relationships: {
                group: { data: { id: 1, type: 'groups' } },
                user: { data: { id: 1, type: 'users' } },
              },
            },
          });
        });

        beforeEach(async function() {
          await userTable.groupDropdownCheckboxes(0).click();
        });

        it('First group is displayed', () => {
          const text = userTable
            .row(0)
            .activeGroups()
            .map((g) => g.text)
            .join('');
          expect(text).to.not.include('None');
          expect(text).to.include('Fake group');
          expect(text).to.not.include('Another Fake group');
        });
      });
    });
  });

  describe('User belongs to two organizations', () => {
    function setupUsersMock() {
      beforeEach(function() {
        this.mockGet(200, '/users', {
          data: [
            {
              type: 'users',
              id: 2,
              attributes: {
                name: 'Fake user',
                email: 'fake-email@fake.email',
              },
              relationships: {
                'group-memberships': {
                  data: [
                    { type: 'group-memberships', id: 4 },
                    { type: 'group-memberships', id: 5 },
                    { type: 'group-memberships', id: 6 },
                  ],
                },
                'organization-memberships': {
                  data: [
                    {
                      type: 'organization-memberships',
                      id: 2,
                    },
                    {
                      type: 'organization-memberships',
                      id: 3,
                    },
                  ],
                },
              },
            },
          ],
          included: [
            {
              type: 'organizations',
              id: 2,
              attributes: { name: 'SIL' },
            },
            {
              type: 'organization-memberships',
              id: 2,
              relationships: {
                organization: { data: { type: 'organization', id: 1 } },
                user: { data: { type: 'user', id: 2 } },
              },
            },
            {
              type: 'organization-memberships',
              id: 3,
              relationships: {
                organization: { data: { type: 'organization', id: 2 } },
                user: { data: { type: 'user', id: 2 } },
              },
            },
            {
              type: 'group-memberships',
              id: 4,
              relationships: {
                group: { data: { type: 'groups', id: 1 } },
                user: { data: { type: 'users', id: 2 } },
              },
            },
            {
              type: 'group-memberships',
              id: 5,
              relationships: {
                group: { data: { type: 'groups', id: 2 } },
                user: { data: { type: 'users', id: 2 } },
              },
            },
            {
              type: 'group-memberships',
              id: 6,
              relationships: {
                group: { data: { type: 'groups', id: 3 } },
                user: { data: { type: 'users', id: 2 } },
              },
            },
            {
              type: 'groups',
              id: 1,
              attributes: { name: 'Fake group', abbreviation: 'FG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            {
              type: 'groups',
              id: 2,
              attributes: { name: 'Another Fake group', abbreviation: 'AFG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            {
              type: 'groups',
              id: 3,
              attributes: { name: 'SIL fake group', abbreviation: 'SFG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 2 } },
              },
            },
          ],
        });
      });
  
    }

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();
      setupApplicationTest();
      setupUsersMock();

      beforeEach(async function() {
        await visit('/users');
      });

      it('does not render second organization', () => {
        const orgNames = userTable.groupDropdownOrganizationName().map((item) => item.text);
        expect(orgNames).to.contain('DeveloperTown');
        expect(orgNames).to.not.contain('SIL');
      });
    });

    describe('Current user belongs to two organizations', () => {
      useFakeAuthentication({
        data: {
          id: 1,
          type: 'users',
          attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
          relationships: {
            ['organization-memberships']: {
              data: [
                { id: 1, type: 'organization-memberships' },
                { id: 6, type: 'organization-memberships' },
              ],
            },
            ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
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
            id: 6,
            type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 1, type: 'users' } },
              organization: { data: { id: 2, type: 'organizations' } },
            },
          },
          {
            type: 'organizations',
            id: 1,
            attributes: { name: 'DeveloperTown' },
          },
          {
            type: 'organizations',
            id: 2,
            attributes: { name: 'SIL' },
          },
          {
            id: 1,
            type: 'user-roles',
            attributes: { roleName: 'SuperAdmin' },
            relationships: {
              ['user']: { data: { id: 1, type: 'users' } },
              ['role']: { data: { id: 1, type: 'roles' } },
              ['organization']: { data: { id: 1, type: 'organizations' } },
            },
          },
          {
            id: 1,
            type: 'roles',
            attributes: { roleName: 'SuperAdmin' },
          },
        ],
      });
      setupApplicationTest();
      setupUsersMock();

      beforeEach(async function() {
        await visit('/users');
        await when(() => new UserTableInteractor().row().length > 0, 2000);
      });

      it('renders two organizations groups', () => {
        userTable = new UserTableInteractor();
        const text = userTable
          .row(0)
          .activeGroups()
          .map((g) => g.text)
          .join('');

        expect(text).to.include('Fake group');
        expect(text).to.include('Another Fake group');
        expect(text).to.include('SIL fake group');
      }).timeout(2000);
    });
  });
});
