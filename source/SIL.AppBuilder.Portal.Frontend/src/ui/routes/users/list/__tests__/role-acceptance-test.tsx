import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import i18n from '@translations/index';

import UserTableInteractor from './-user-table';

let userTable = new UserTableInteractor();

describe('Acceptance | User List | Role Management', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('current user is in one organization', () => {
    useFakeAuthentication();

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
      const actual = userTable.row(0).role.list;
      expect(actual).to.include('AppBuilder');
      expect(actual).to.include('OrganizationAdmin');
    });

    describe('remove user from all roles', () => {
      beforeEach(function() {
        this.mockDelete(204, 'user-roles/2');
        this.mockDelete(204, 'user-roles/3');
      });

      beforeEach(async function() {
        await userTable.toggleRoleAt(0, 'AppBuilder', 'DeveloperTown');
        await userTable.toggleRoleAt(0, 'OrganizationAdmin', 'DeveloperTown');
      });

      it('no roles are assigned', () => {
        const actual = userTable.row(0).role.list;
        const expected = i18n.t('users.noRoles');

        expect(actual).to.include(expected);
      }).timeout(2000);

      describe('add one role back', () => {
        beforeEach(function() {
          this.mockPost(201, 'user-roles', {
            data: {
              attributes: {},
              id: 2,
              type: 'user-roles',
              relationships: {
                role: { data: { id: 1, type: 'role' } },
                user: { data: { id: 1, type: 'users' } },
              },
            },
          });
        });

        beforeEach(async function() {
          await userTable.toggleRoleAt(0, 'AppBuilder', 'DeveloperTown');
        });

        it('the role is displayed', () => {
          const actual = userTable.row(0).role.list;
          expect(actual).to.include('AppBuilder');
        });
      });
    });
  });

  describe('A User belongs to two organizations', () => {
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
          userRoleFrom(roles.orgAdmin, { id: 2, userId: 2, orgId: 1 }),
          userRoleFrom(roles.appBuilder, { id: 3, userId: 2, orgId: 1 }),
          roles.orgAdmin,
          roles.appBuilder,
        ],
      });
    });

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();

      beforeEach(async function() {
        await visit('/users');
        userTable = new UserTableInteractor();

        await userTable.row(0).role.open();
      });

      it('does not render second organization', () => {
        const orgNames = userTable.row(0).role.organizationNames;

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

  describe('current user is editing itself', () => {
    useFakeAuthentication();

    beforeEach(function() {
      const paylo1ad = {
        data: [
          {
            ...this.currentUser,
            relationships: {
              'user-roles': {
                data: [{ type: 'user-roles', id: 2 }, { type: 'user-roles', id: 3 }],
              },
              'organization-memberships': {
                data: [{ type: 'organization-memberships', id: 2 }],
              },
              'group-memberships': { data: [] },
            },
          },
        ],
        included: [
          // this.currentOrganization,
          {
            type: 'organization-memberships',
            id: 2,
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              user: { data: { type: 'user', id: 1 } },
            },
          },
          userRoleFrom(roles.orgAdmin, { id: 2, userId: 1, orgId: 1 }),
          userRoleFrom(roles.appBuilder, { id: 3, userId: 1, orgId: 1 }),
        ],
      };

      const payload = {
        data: [
          {
            attributes: {
              name: 'Chris Hubbard',
              'given-name': 'Chris',
              'family-name': 'Hubbard',
              email: 'chris_hubbard@sil.org',
              phone: null,
              timezone: null,
              locale: null,
              'is-locked': false,
              auth0Id: 'google-oauth2|116747902156680384840',
              'profile-visibility': 1,
              'email-notification': true,
              'workflow-user-id': '75dcb91c-0ec5-4711-b7a7-fcfd90dc8983',
              'date-created': null,
              'date-updated': '2019-02-04T19:10:02.63153',
            },
            relationships: {
              'organization-memberships': {
                data: [
                  {
                    type: 'organization-memberships',
                    id: '1',
                  },
                ],
              },
              'user-roles': {
                data: [{ type: 'user-roles', id: 2 }, { type: 'user-roles', id: 3 }],
              },
            },
            type: 'users',
            id: '1',
          },
        ],
        included: [
          userRoleFrom(roles.orgAdmin, { id: 2, userId: 1, orgId: 1 }),
          userRoleFrom(roles.appBuilder, { id: 3, userId: 1, orgId: 1 }),
          {
            attributes: {
              email: null,
              'user-id': 1,
              'organization-id': 1,
            },
            relationships: {
              user: {
                links: {
                  self: 'http://api:7081/api/organization-memberships/1/relationships/user',
                  related: 'http://api:7081/api/organization-memberships/1/user',
                },
                data: {
                  type: 'users',
                  id: '1',
                },
              },
              organization: {
                links: {
                  self: 'http://api:7081/api/organization-memberships/1/relationships/organization',
                  related: 'http://api:7081/api/organization-memberships/1/organization',
                },
                data: {
                  type: 'organizations',
                  id: '1',
                },
              },
            },
            type: 'organization-memberships',
            id: '1',
          },
          {
            attributes: {
              name: 'SIL International',
              'website-url': 'https://sil.org',
              'build-engine-url': 'https://buildengine.gtis.guru:8443',
              'build-engine-api-access-token': 'replace',
              'logo-url': null,
              'use-default-build-engine': false,
              'public-by-default': true,
            },
            relationships: {
              owner: {
                links: {
                  self: 'http://api:7081/api/organizations/1/relationships/owner',
                  related: 'http://api:7081/api/organizations/1/owner',
                },
                data: {
                  type: 'users',
                  id: '1',
                },
              },
              'organization-memberships': {
                data: [
                  {
                    type: 'organization-memberships',
                    id: '10',
                  },
                  {
                    type: 'organization-memberships',
                    id: '1',
                  },
                  {
                    type: 'organization-memberships',
                    id: '20',
                  },
                  {
                    type: 'organization-memberships',
                    id: '15',
                  },
                ],
              },
              groups: {
                links: {
                  self: 'http://api:7081/api/organizations/1/relationships/groups',
                  related: 'http://api:7081/api/organizations/1/groups',
                },
                data: [
                  {
                    type: 'groups',
                    id: '3',
                  },
                  {
                    type: 'groups',
                    id: '8',
                  },
                  {
                    type: 'groups',
                    id: '10',
                  },
                  {
                    type: 'groups',
                    id: '4',
                  },
                  {
                    type: 'groups',
                    id: '9',
                  },
                  {
                    type: 'groups',
                    id: '5',
                  },
                  {
                    type: 'groups',
                    id: '12',
                  },
                  {
                    type: 'groups',
                    id: '11',
                  },
                  {
                    type: 'groups',
                    id: '6',
                  },
                  {
                    type: 'groups',
                    id: '1',
                  },
                  {
                    type: 'groups',
                    id: '2',
                  },
                  {
                    type: 'groups',
                    id: '7',
                  },
                  {
                    type: 'groups',
                    id: '13',
                  },
                ],
              },
              'organization-product-definitions': {},
              'organization-stores': {},
              'user-roles': {
                data: [
                  {
                    type: 'user-roles',
                    id: '4',
                  },
                  {
                    type: 'user-roles',
                    id: '1',
                  },
                  {
                    type: 'user-roles',
                    id: '16',
                  },
                ],
              },
            },
            type: 'organizations',
            id: '1',
          },
        ],
        meta: {
          'total-records': 8,
        },
      };

      this.mockGet(200, '/users', payload);
    });

    beforeEach(async function() {
      await visit('/users');

      userTable = new UserTableInteractor();
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    xit('text instead of dropdown', () => {
      const text = userTable.row(0).role.noEditText;
      expect(text).to.include('AppBuilder');
      expect(text).to.include('OrganizationAdmin');
      expect(userTable.row(0).role.isOpen).to.be.false;
    });
  });
});
