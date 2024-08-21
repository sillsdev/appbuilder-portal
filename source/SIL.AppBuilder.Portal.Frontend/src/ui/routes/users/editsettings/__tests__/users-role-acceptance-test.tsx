import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import { setupApplicationTest, useFakeAuthentication, fakeAuth0Id } from 'tests/helpers';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import appPage from 'tests/helpers/pages/app';

import page from './-page';

describe('Acceptance | User Roles', () => {
  describe('current user is in one organization', () => {
    useFakeAuthentication();
    setupApplicationTest();

    beforeEach(function() {
      this.mockGet(200, '/groups', { data: [] });
      this.mockGet(200, '/users/2', {
        data: {
          type: 'users',
          id: 2,
          attributes: {
            name: 'Fake user',
            email: 'fake.user@fake.com',
          },
          relationships: {
            'user-roles': {
              data: [
                { type: 'user-roles', id: 2 },
                { type: 'user-roles', id: 3 },
              ],
            },
            'organization-memberships': {
              data: [{ type: 'organization-memberships', id: 2 }],
            },
          },
        },
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
      await visit('/users/2/settings/roles');
      await when(() => page.isVisible);
    });

    it('is in users roles edit settings page', () => {
      expect(location().pathname).to.equal('/users/2/settings/roles');
    });

    it('returned one organization and it is DEVELOPERTOWN', () => {
      expect(page.roleTab.orgRoles().length).to.equal(1);
      expect(page.roleTab.orgRoles(0).roleOrganizationText).to.equal('DEVELOPERTOWN');
    });

    it('has two roles displayed', () => {
      expect(page.roleTab.orgRoles(0).roleEntries().length).to.equal(2);
      expect(page.roleTab.orgRoles(0).roleEntries(0).text).to.equal('AppBuilder');
      expect(page.roleTab.orgRoles(0).roleEntries(1).text).to.equal('OrganizationAdmin');
    });

    describe('remove user from all roles', () => {
      beforeEach(function() {
        this.mockDelete(204, 'user-roles/2');
        this.mockDelete(204, 'user-roles/3');
      });

      beforeEach(async function() {
        await page.roleTab
          .orgRoles(0)
          .roleEntries(0)
          .toggleRoleSelect();
        await page.roleTab
          .orgRoles(0)
          .roleEntries(1)
          .toggleRoleSelect();
        //await when(() => appPage.toast.text);
      });

      it('both roles are successfully toggled off', () => {
        expect(page.roleTab.orgRoles(0).roleEntries(0).isChecked).to.be.false;
        expect(page.roleTab.orgRoles(0).roleEntries(1).isChecked).to.be.false;
      });

      xit('toasts successful removal from role', () => {
        const toast = appPage.toast.messages(0);
        expect(toast.text).to.include(`Fake user removed from role`);
        expect(toast.isSuccess).to.equal(true);
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
          await page.roleTab
            .orgRoles(0)
            .roleEntries(0)
            .toggleRoleSelect();
          //await when(() => appPage.toast.text);
        });

        it('First role is added', () => {
          expect(page.roleTab.orgRoles(0).roleEntries(0).isChecked).to.be.true;
          expect(page.roleTab.orgRoles(0).roleEntries(1).isChecked).to.be.false;
        });

        xit('and toasted on success', () => {
          const lastIndex = appPage.toast.messages().length - 1;
          const toast = appPage.toast.messages(lastIndex);
          expect(toast.text).to.include(`Fake user added to role`);
          expect(toast.isSuccess).to.equal(true);
        });
      });
    });
  });

  describe('A User belongs to two organizations', () => {
    function setupData() {
      beforeEach(function() {
        this.mockGet(200, '/groups', { data: [] });
        this.mockGet(200, '/users/2', {
          data: {
            type: 'users',
            id: 2,
            attributes: {
              name: 'Fake user',
              email: 'fake.user@fake.com',
            },
            relationships: {
              'user-roles': {
                data: [
                  { type: 'user-roles', id: 2 },
                  { type: 'user-roles', id: 3 },
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
    }

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();
      setupApplicationTest();
      setupData();

      beforeEach(async function() {
        await visit('/users/2/settings/roles');
        await when(() => page.isVisible);
      });

      it('does not render second organization', () => {
        expect(page.roleTab.orgRoles().length).to.equal(1);
        expect(page.roleTab.orgRoles(0).roleOrganizationText).to.equal('DEVELOPERTOWN');
      });
    });

    describe('Current user belongs to two organizations and is super admin', () => {
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
        await visit('/users/2/settings/roles');
        await when(() => page.isVisible);
      });

      it('renders two organizations - DEVELOPERTOWN and SIL', () => {
        expect(page.roleTab.orgRoles().length).to.equal(2);
        expect(page.roleTab.orgRoles(0).roleOrganizationText).to.equal('DEVELOPERTOWN');
        expect(page.roleTab.orgRoles(1).roleOrganizationText).to.equal('SIL');
      });

      it('renders two organizations roles', () => {
        expect(page.roleTab.orgRoles(0).roleEntries().length).to.equal(2);
        expect(page.roleTab.orgRoles(0).roleEntries(0).text).to.equal('AppBuilder');
        expect(page.roleTab.orgRoles(0).roleEntries(1).text).to.equal('OrganizationAdmin');
        expect(page.roleTab.orgRoles(1).roleEntries().length).to.equal(2);
        expect(page.roleTab.orgRoles(1).roleEntries(0).text).to.equal('AppBuilder');
        expect(page.roleTab.orgRoles(1).roleEntries(1).text).to.equal('OrganizationAdmin');
      }).timeout(2000);
    });
  });

  describe('current user is editing itself', () => {
    function setupData() {
      beforeEach(function() {
        this.mockGet(200, '/groups', { data: [] });
        this.mockGet(200, '/users/1', {
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
            userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId: 1 }),
            roles.orgAdmin,
          ],
        });
      });
    }
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
        userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId: 1 }),
        roles.orgAdmin,
      ],
    });
    setupApplicationTest();
    setupData();

    beforeEach(async function() {
      await visit('/users/1/settings/roles');
      await when(() => page.isVisible);
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users/1/settings/roles');
    });

    it('text instead of toggles', () => {
      expect(page.roleTab.orgRoles().length).to.equal(2);
      expect(page.roleTab.orgRoles(0).roleOrganizationText).to.equal('DEVELOPERTOWN');
      expect(page.roleTab.orgRoles(1).roleOrganizationText).to.equal('SIL');
      expect(page.roleTab.orgRoles(0).roleEntries().length).to.equal(0);
      expect(page.roleTab.orgRoles(1).roleEntries().length).to.equal(0);
      expect(page.roleTab.orgRoles(0).roleList.text).to.equal('OrganizationAdmin');
      expect(page.roleTab.orgRoles(1).roleList.text).to.equal('No roles assigned');
    });
  });
});
