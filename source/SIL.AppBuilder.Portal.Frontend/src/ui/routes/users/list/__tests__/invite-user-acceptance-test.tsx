import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { visit } from '@bigtest/react';
import { Interactor } from '@bigtest/interactor';
import { expect } from 'chai';
import { fakeAuth0Id } from 'tests/helpers/jwt';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';
import appPage from 'tests/helpers/pages/app';

import page from './-page';

describe('Acceptance | User list | Invite User', () => {
  setupRequestInterceptor();
  let usersData;
  let user;
  beforeEach(async function() {
    user = {
      type: 'users',
      id: '1',
      attributes: {
        name: 'Fake user',
        email: 'el-fake-o@fake.com',
        'is-locked': false,
      },
    };
    usersData = {
      data: [user],
    };
    this.mockGet(200, '/users', usersData);

    this.mockGet(200, '/groups', {
      data: [
        {
          type: 'groups',
          id: '2',
          attributes: {
            name: 'Fake group',
          },
        },
      ],
    });
  });

  describe('in all orgs context', () => {
    setupApplicationTest({
      data: { currentOrganizationId: '' },
    });
    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
        relationships: {
          ['organization-memberships']: {
            data: [
              { id: 1, type: 'organization-memberships' },
              { id: 2, type: 'organization-memberships' },
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
          id: 2,
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
          type: 'groups',
          attributes: { name: 'Some Group' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        userRoleFrom(roles.superAdmin, { id: 1, userId: 1, orgId: 1 }),
        roles.superAdmin,
      ],
    });
    beforeEach(async () => {
      visit('/users');
      await when(() => page.isVisible);
      await when(() => page.userTable.isVisible);
    });

    it.always('should not show invite user button', () => {
      expect(page.inviteUserButton.isPresent).to.be.false;
    });
  });

  describe('in current org context', () => {
    setupApplicationTest({
      data: { currentOrganizationId: '1' },
    });
    useFakeAuthentication();
    beforeEach(async () => {
      await visit('/users');
      await when(() => page.isVisible);
      await when(() => page.userTable.isVisible);
    });

    describe('clicking add user', () => {
      beforeEach(async () => {
        await page.inviteUser();
      });
      it('opens modal', () => {
        expect(page.inviteUserModal.isVisible).to.be.true;
      });

      describe('invite a user', () => {
        beforeEach(async () => {
          await when(() => page.inviteUserModal.isVisible);
        });

        describe('successuful invite', () => {
          const existingEmail = 'existing@foo.com';
          beforeEach(async function() {
            this.mockPost(201, '/organization-membership-invites', {
              data: {
                attributes: {
                  token: '5a27a5eb-2719-4cff-99cb-bfdf1a89bf0e',
                  email: 'jon.nolen@gmail.com',
                  expires: '2019-01-18T00:00:00',
                  redeemed: false,
                  'invited-by-id': 13,
                  'organization-id': 2,
                  'date-created': '2019-01-11T14:28:38.195038Z',
                  'date-updated': '2019-01-11T14:28:38.195038Z',
                },
                relationships: {
                  'invited-by': {
                    data: {
                      type: 'users',
                      id: '13',
                    },
                  },
                  organization: {
                    data: {
                      type: 'organizations',
                      id: '2',
                    },
                  },
                },
                type: 'organization-membership-invites',
                id: '9',
              },
            });

            await page.inviteUserModal.enterEmail(existingEmail);
            await page.inviteUserModal.submit();
            await when(() => appPage.toast.text);
          });

          it('closes modal', () => {
            expect(page.inviteUserModal.isPresent).to.be.false;
          });

          it('toasts success', () => {
            const toast = appPage.toast.messages(0);

            expect(toast.text).to.include(`Invite sent to ${existingEmail}.`);
            expect(toast.isSuccess).to.equal(true);
          });
        });

        describe('unsuccessful invite', () => {
          const nonExistingEmail = 'missing@foo.com';
          beforeEach(async function() {
            this.mockPost(422, '/organization-membership-invites');
            await page.inviteUserModal.enterEmail(nonExistingEmail);
            await page.inviteUserModal.submit();
          });

          it('shows error', () => {
            expect(page.inviteUserModal.hasError('Error occured while trying to invite user.')).to
              .be.true;
          });

          describe('clears error on close', () => {
            beforeEach(async () => {
              await page.inviteUser();

              await when(() => !page.inviteUserModal.isPresent);
              await page.inviteUser();
              await when(() => page.inviteUserModal.isVisible);
            });

            it.always('has cleared the error', () => {
              expect(page.inviteUserModal.hasError('Error occured while trying to invite user.')).to
                .be.false;
            });
          });
        });
      });
    });
  });
});
