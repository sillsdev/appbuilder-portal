import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import { setupApplicationTest, useFakeAuthentication, fakeAuth0Id } from 'tests/helpers';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import appPage from 'tests/helpers/pages/app';

import page from './-page';

describe('Acceptance | User Groups', () => {
  describe('current user is in one organization', () => {
    describe('with two roles and two groups', () => {
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
        await visit('/users/2/editsettings/settings/groups');
        await when(() => page.isVisible);
        await when(() => page.groupTab.isVisible);
      });

      it('is in users group page', () => {
        console.log(page.groupTab.orgGroups().length);
        expect(location().pathname).to.equal('/users/2/editsettings/settings/groups');
      });

      it('returned one organization and it is DEVELOPERTOWN', () => {
        expect(page.groupTab.orgGroups().length).to.equal(1);
        expect(page.groupTab.orgGroups(0).groupOrganizationText).to.equal('DEVELOPERTOWN');
      });

      it('has two groups displayed', () => {
        expect(page.groupTab.orgGroups(0).groupEntries().length).to.equal(2);
        expect(page.groupTab.orgGroups(0).groupEntries(0).text).to.equal('First Fake group');
        expect(page.groupTab.orgGroups(0).groupEntries(1).text).to.equal('Some Fake group');
      });

      describe('remove user from all groups', () => {
        beforeEach(function() {
          this.mockDelete(204, 'group-memberships/2');
          this.mockDelete(204, 'group-memberships/3');
        });

        beforeEach(async function() {
          console.log('Group:', page.groupTab.orgGroups(0).groupEntries(0).groupMember.text);
          await page.groupTab
            .orgGroups(0)
            .groupEntries(0)
            .toggleGroupMember();
          await page.groupTab
            .orgGroups(0)
            .groupEntries(1)
            .toggleGroupMember();
          await when(() => appPage.toast.text);
        });

        it('both group memberships are successfully toggled off', () => {
          expect(page.groupTab.orgGroups(0).groupEntries(0).isChecked).to.be.false;
          expect(page.groupTab.orgGroups(0).groupEntries(1).isChecked).to.be.false;
        });

        it('toasts successful removal from group', () => {
          const toast = appPage.toast.messages(0);

          expect(toast.text).to.include(`Fake user removed from group`);
          expect(toast.isSuccess).to.equal(true);
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
            await page.groupTab
              .orgGroups(0)
              .groupEntries(0)
              .toggleGroupMember();
            await when(() => appPage.toast.text);
          });

          it('First group is added', () => {
            expect(page.groupTab.orgGroups(0).groupEntries(0).isChecked).to.be.true;
            expect(page.groupTab.orgGroups(0).groupEntries(1).isChecked).to.be.false;
          });

          it('and toasted on success', () => {
            const lastIndex = appPage.toast.messages().length - 1;
            const toast = appPage.toast.messages(lastIndex);
            expect(toast.text).to.include(`Fake user added to group`);
            expect(toast.isSuccess).to.equal(true);
          });
        });
      });
    });
  });

  describe('User belongs to two organizations', () => {
    function setupUsersMock() {
      beforeEach(function() {
        this.mockGet(200, '/groups', { data: [] });
        this.mockGet(200, '/users/2', {
          data: {
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
        await visit('/users/2/editsettings/settings/groups');
      });

      it('does not render second organization', () => {
        expect(page.groupTab.orgGroups().length).to.equal(1);
        expect(page.groupTab.orgGroups(0).groupOrganizationText).to.equal('DEVELOPERTOWN');
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
        await visit('/users/2/editsettings/settings/groups');
      });

      it('renders two organizations - DEVELOPERTOWN and SIL', () => {
        expect(page.groupTab.orgGroups().length).to.equal(2);
        expect(page.groupTab.orgGroups(0).groupOrganizationText).to.equal('DEVELOPERTOWN');
        expect(page.groupTab.orgGroups(1).groupOrganizationText).to.equal('SIL');
      });

      it('renders two organizations groups', () => {
        expect(page.groupTab.orgGroups(0).groupEntries().length).to.equal(2);
        expect(page.groupTab.orgGroups(0).groupEntries(1).text).to.equal('Fake group');
        expect(page.groupTab.orgGroups(0).groupEntries(0).text).to.equal('Another Fake group');
        expect(page.groupTab.orgGroups(1).groupEntries(0).text).to.equal('SIL fake group');
      }).timeout(2000);
    });
  });
});
