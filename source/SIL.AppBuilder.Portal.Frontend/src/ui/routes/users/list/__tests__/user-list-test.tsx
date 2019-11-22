import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import i18n from '@translations/index';

import UserTableInteractor from './-user-table';

let userTable = new UserTableInteractor();

describe('Acceptance | User List | Table', () => {
  describe('current user is in one organization', () => {
    describe('with two roles and two groups', () => {
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
                email: 'fake.user@fake.com',
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
                'user-roles': {
                  data: [{ type: 'user-roles', id: 2 }, { type: 'user-roles', id: 3 }],
                },
                'organization-memberships': {
                  data: [{ type: 'organization-memberships', id: 2 }],
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
              attributes: { name: 'First Fake group', abbreviation: 'FG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            {
              type: 'groups',
              id: 2,
              attributes: { name: 'Some Fake group', abbreviation: 'AFG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            userRoleFrom(roles.orgAdmin, { id: 2, userId: 2, orgId: 1 }),
            userRoleFrom(roles.appBuilder, { id: 3, userId: 2, orgId: 1 }),
            roles.orgAdmin,
            roles.appBuilder,
          ],
        });
      });

      beforeEach(async function() {
        await visit('/users');
        userTable = new UserTableInteractor();
        await when(() => userTable.isVisible);
      });

      it('is in users page', () => {
        expect(location().pathname).to.equal('/users');
      });

      it('two roles are selected', () => {
        const actual = userTable.row(0).role.noEditText;
        expect(actual).to.include('AppBuilder');
        expect(actual).to.include('OrganizationAdmin');
      });

      it('two groups are selected', () => {
        const text = userTable
          .row(0)
          .activeGroups()
          .map((g) => g.text)
          .join('');

        expect(text).to.not.include('None');
        expect(text).to.include('First Fake group');
        expect(text).to.include('Some Fake group');
      });
    });
  });
  describe('current user is in one organization', () => {
    describe('with no roles or group memberships', () => {
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
                email: 'fake.user@fake.com',
              },
              relationships: {
                'organization-memberships': {
                  data: [{ type: 'organization-memberships', id: 2 }],
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
              type: 'groups',
              id: 1,
              attributes: { name: 'First Fake group', abbreviation: 'FG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            {
              type: 'groups',
              id: 2,
              attributes: { name: 'Some Fake group', abbreviation: 'AFG' },
              relationships: {
                owner: { data: { type: 'organizations', id: 1 } },
              },
            },
            roles.orgAdmin,
            roles.appBuilder,
          ],
        });
      });

      beforeEach(async function() {
        await visit('/users');
        userTable = new UserTableInteractor();
        await when(() => userTable.isVisible);
      });

      it('None is displayed for groups', () => {
        const text = userTable.groupDropdownText;

        expect(text).to.include('None');
        expect(text).to.not.include('First Fake group');
        expect(text).to.not.include('Some Fake group');
      });

      it('no roles are assigned', () => {
        const actual = userTable.row(0).role.noEditText;
        const expected = i18n.t('users.noRoles');

        expect(actual).to.include(expected);
      }).timeout(2000);
    });
  });

  describe('A User belongs to two organizations', () => {
    function setupData() {
      beforeEach(function() {
        this.mockGet(200, '/users', {
          data: [
            {
              type: 'users',
              id: 2,
              attributes: {
                name: 'Fake user',
                'given-name': 'Fake',
                'family-name': 'user',
                email: 'fake.user@fake.com',
              },
              relationships: {
                'group-memberships': {
                  data: [
                    { type: 'group-memberships', id: 4 },
                    { type: 'group-memberships', id: 5 },
                    { type: 'group-memberships', id: 6 },
                  ],
                },
                'user-roles': {
                  data: [{ type: 'user-roles', id: 2 }, { type: 'user-roles', id: 3 }],
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
              id: 1,
              attributes: { name: 'DeveloperTown' },
            },
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
            userRoleFrom(roles.orgAdmin, { id: 2, userId: 2, orgId: 1 }),
            userRoleFrom(roles.appBuilder, { id: 3, userId: 2, orgId: 1 }),
            roles.orgAdmin,
            roles.appBuilder,
          ],
        });
      });
    }

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();
      setupApplicationTest();
      setupData();

      beforeEach(async function() {
        await visit('/users');
        userTable = new UserTableInteractor();

        await userTable.row(0).role.isOpen;
      });

      it('does not render second organization for role', () => {
        const orgNames = userTable.row(0).role.list;
        expect(orgNames).to.contain('DeveloperTown');
        expect(orgNames).to.not.contain('SIL');
      });

      it('does not render second organization for group', () => {
        const orgNames = userTable
          .row(0)
          .groupOrganizations()
          .map((item) => item.text);
        console.log(orgNames);
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
          userRoleFrom(roles.superAdmin, { id: 1, userId: 1, orgId: 1 }),
          roles.superAdmin,
        ],
      });
      setupApplicationTest();
      setupData();

      beforeEach(async function() {
        await visit('/users');
        userTable = new UserTableInteractor();
        await when(() => userTable.row().length > 0);
      });

      it('renders two roles', () => {
        const actual = userTable.row(0).role.list;

        expect(actual).to.include('AppBuilder');
        expect(actual).to.include('OrganizationAdmin');
      });
    });
  });
});
