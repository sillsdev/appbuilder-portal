import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';

import page from './page';

describe('Acceptance | User List | Role Management', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('current user is in one organization', () => {
    useFakeAuthentication();

    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: 2,
          attributes: {
            name: "Fake user"
          },
          relationships: {
            'user-roles': {
              data: [
                { type: 'user-roles', id: 2 },
                { type: 'user-roles', id: 3 }
              ]
            },
            'organization-memberships': {
              data: [{ type: 'organization-memberships', id: 2 }]
            }
          }
        }],
        included: [
          {
            type: 'organization-memberships',
            id: 2,
            relationships: {
              organization: { data: { type: 'organization', id: 1}},
              user: { data: { type: 'user', id: 2}}
            }
          },
          userRoleFrom(roles.orgAdmin, { id: 1, userId: 2, orgId: 1 }),
          userRoleFrom(roles.appBuilder, { id: 2, userId: 2, orgId: 1 }),
          roles.orgAdmin,
          roles.appBuilder
        ]
      });
    });

    beforeEach(async function () {
      await visit('/users');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    it('two roles are selected', () => {
      expect(page.roleDropdownText).to.equal('Organization Admin, App Builder');
    });

    describe('remove user from all roles',() => {
      beforeEach(function() {
        this.mockDelete(204,'user-roles/2');
        this.mockDelete(204,'user-roles/3');
      });

      beforeEach(async function() {
        await page.roleDropdownCheckboxes(0).click();
        await page.roleDropdownCheckboxes(1).click();
      });

      it('None is displayed',() => {
        expect(page.roleDropdownText).to.equal('None');
      });

      describe('add one role back', () => {
        beforeEach(function() {
          this.mockPost(201, 'user-roles', {
            data: {
              attributes: { },
              id: 2,
              type: 'user-roles',
              relationships: {
                role: { data: { id: 1, type: 'role' } },
                user: { data: { id: 1, type: 'users' } }
              }
            }
          });
        });

        beforeEach(async function() {
          await page.roleDropdownCheckboxes(0).click();
        });

        it('First role is displayed', () => {
          expect(page.roleDropdownText).to.equal('Fake role');
        });
      });
    });
  });

  describe('User belongs to two organizations',() => {
    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: 2,
          attributes: {
            name: "Fake user"
          },
          relationships: {
            'user-roles': {
              data: [
                { type: 'user-roles', id: 2 },
                { type: 'user-roles', id: 3 }
              ]
            },
            'organization-memberships': {
              data: [{
                type: "organization-memberships", id: 2
              }, {
                type: "organization-memberships", id: 3
              }]
            }
          }
        }],
        included: [
          {
            type: 'organizations',
            id: 2,
            attributes: { name: 'SIL' }
          }, {
            type: 'organization-memberships',
            id: 2,
            relationships: {
              organization: { data: { type: 'organization', id: 1 } },
              user: { data: { type: 'user', id: 2 } }
            }
          }, {
            type: 'organization-memberships',
            id: 3,
            relationships: {
              organization: { data: { type: 'organization', id: 2 } },
              user: { data: { type: 'user', id: 2 } }
            }
          },
          userRoleFrom(roles.orgAdmin, { id: 1, userId: 2, orgId: 1 }),
          userRoleFrom(roles.appBuilder, { id: 2, userId: 2, orgId: 1 }),
          roles.orgAdmin,
          roles.appBuilder,
        ]
      });
    });

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();

      beforeEach(async function () {
        await visit('/users');
      });

      it('does not render second organization',() => {
        const orgNames = page.roleDropdownOrganizationName().map(item => item.text);
        expect(orgNames).to.contain('DeveloperTown');
        expect(orgNames).to.not.contain('SIL');
      });
    });

    describe('Current user belongs to two organizations',() => {
      useFakeAuthentication({
        data: {
          id: 1,
          type: 'users',
          attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
          relationships: {
            ['organization-memberships']: {
              data: [
                { id: 1, type: 'organization-memberships' },
                { id: 6, type: 'organization-memberships' }
              ]
            },
            ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
          }
        },
        included: [
          {
            id: 1,
            type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 1, type: 'users' } },
              organization: { data: { id: 1, type: 'organizations' } }
            }
          },
          {
            id: 6,
            type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 1, type: 'users'} },
              organization: { data: { id: 2, type: 'organizations'}}
            }
          },
          {
            type: 'organizations',
            id: 1,
            attributes: { name: 'DeveloperTown' }
          },
          {
            type: 'organizations',
            id: 2,
            attributes: { name: 'SIL'}
          },
          userRoleFrom(roles.superAdmin, { id: 1, userId: 2, orgId: 1 }),
          roles.superAdmin,
        ]
      });

      beforeEach(async function () {
        await visit('/users');
      });

      it('renders two roles', () => {
        expect(page.roleDropdownText).to.equal('App Builder, Organization Admin');
      });

    });
  });
});