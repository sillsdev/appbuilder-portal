
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

    useFakeAuthentication(undefined, {
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

    beforeEach(function() {
      this.mockGet(200, '/groups', {
        data: [{
          type: 'groups',
          id: '2',
          attributes: {
            name: 'Fake group'
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
          }
        ]
      });
    });

    beforeEach(async function () {
      await visit('/users');
    });

    describe('Render user table when "all organization" is selected',() => {

      beforeEach(async function () {
        await app.openSidebar();
        await app.openOrgSwitcher();
        await switcher.selectAllOrg();
      });

      it('all user are rendered', () => {

        expect(page.usernames().length).to.equal(3);

        const usernames = page.usernames();
        const text = usernames.map(u => u.text).join();

        expect(text).to.include('fake fake');
        expect(text).to.include('One fake');
        expect(text).to.include('Two fake');
      });
    });

    describe('Render user table when first organization is selected',() => {

      beforeEach(async function() {
        await app.openSidebar();
        await app.openOrgSwitcher();
        await switcher.selectOrg();
      });

      it('users from first organization are rendered', () => {
        expect(page.usernames().length).to.equal(2);
      });

      it('Only the users from the selected organization are rendered', () => {

        const usernames = page.usernames();
        const text = usernames.map(u => u.text).join();

        expect(text).to.include('fake fake');

      });

    });
  });


});