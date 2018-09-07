
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import app from 'tests/helpers/pages/app';
import switcher from '@ui/components/sidebar/org-switcher/__tests__/page';
import page from './page';

describe('Acceptance | User list | Filtering users by organization', () => {

  setupApplicationTest();
  setupRequestInterceptor();

  describe('User belongs multiple organizations', () => {

    useFakeAuthentication();

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [{
          type: 'organizations', id: 1,
          attributes: {
            name: 'SIL International'
          }
        }, {
          type: 'organizations', id: 2,
          attributes: {
            name: 'DeveloperTown'
          }
        }, {
          type: 'organizations', id: 3,
          attributes: {
            name: 'Kalaam Media'
          }
        }]
      });
    });

    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: 2,
          attributes: { id: 1, familyName: 'fake', givenName: 'One' },
          relationships: {
            ['organization-memberships']: { data: [ { id: 2, type: 'organization-memberships' }]},
            "group-memberships": {}
          }
        }, {
          type: 'users',
          id: 3,
          attributes: { id: 1, familyName: 'fake', givenName: 'Two' },
          relationships: {
            ['organization-memberships']: { data: [ { id: 3, type: 'organization-memberships' }]},
            "group-memberships": {}
          },
        }],
        included: [
          {
            id: 2, type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 2, type: 'users' } },
              organization: { data: { id: 1, type: 'organizations' } }
            }
          },
          {
            id: 3, type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 3, type: 'users' } },
              organization: { data: { id: 2, type: 'organizations' } }
            }
          },
          {
            type: 'organizations', id: 1,
            attributes: {
              name: 'SIL International'
            }
          }, {
            type: 'organizations', id: 2,
            attributes: {
              name: 'DeveloperTown'
            }
          }
        ]
      });
    });

    describe('Select all organizations',() => {

      beforeEach(async function () {
        await visit('/users');
        await app.openSidebar();
        await app.openOrgSwitcher();
        await switcher.selectAllOrg();
      });

      describe('Renders users page', () => {

        it('Should see all users', () => {

          expect(page.usernames().length).to.equal(3);

          const usernames = page.usernames();
          const text = usernames.map(u => u.text).join();

          expect(text).to.include('fake fake');
          expect(text).to.include('One fake');
          expect(text).to.include('Two fake');
        });

        describe('Select a specific organization', () => {

          beforeEach(async function () {
            await app.openSidebar();
            await app.openOrgSwitcher();
            await switcher.selectOrg();
          });

          it('Only display the users that belong to the selected organization', () => {

            expect(page.usernames().length).to.equal(2);

            const usernames = page.usernames();
            const text = usernames.map(u => u.text).join();

            expect(text).to.include('fake fake');
            expect(text).to.include('One fake');
            expect(text).to.not.include('Two fake');

          });

        });
      });
    });
  });
});
