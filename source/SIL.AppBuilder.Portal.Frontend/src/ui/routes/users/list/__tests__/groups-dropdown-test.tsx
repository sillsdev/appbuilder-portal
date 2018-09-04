import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe.only('Acceptance | User list | Group dropdown', () => {

  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('User table renders with empty group dropdown', () => {

    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: 2,
          attributes: { id: 1, familyName: 'fake', givenName: 'One' },
          relationships: {
            ['organization-memberships']: { data: [{ id: 2, type: 'organization-memberships' }] },
            "group-memberships": {}
          }
        }],
        included: [
          {
            id: 2, type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 2, type: 'users' } },
              organization: { data: { id: 1, type: 'organizations' } }
            }
          }
        ]
      });
    });

    beforeEach(function () {
      this.mockGet(200, '/groups', {
        data: [{
          type: 'groups',
          id: '1',
          attributes: {
            name: 'Fake group one'
          }
        }, {
          type: 'groups',
          id: '2',
          attributes: {
            name: 'Fake group two'
          }
        },{
          type: 'groups',
          id: '3',
          attributes: {
            name: 'Fake group three'
          }
        }]
      });
    });

    beforeEach(async () => {
      await visit('/users');
    });

    it('renders empty group dropdown',() => {
      expect(location().pathname).to.equal('/users');
      expect(page.groupSelect.dropdownText).to.be.equal('None');
    });

    describe('Select one group', () => {

      beforeEach(async () => {
        await page.groupSelect.clickDropdown();
        await page.groupSelect.chooseGroup('Some Group');
      });

      it('has one group selected',() => {
        expect(page.groupSelect.dropdownText).to.be.equal('Some...');
      })

      describe('Select more than one group', () => {

        beforeEach(async () => {
          await page.groupSelect.chooseGroup('Fake group one');
        });

        it('has two groups selected',() => {
          expect(page.groupSelect.dropdownText).to.be.equal('Some..., Fake...');
        });

        describe('Select all groups',() => {

          beforeEach(async () => {
            await page.groupSelect.chooseGroup('Fake group two');
            await page.groupSelect.chooseGroup('Fake group three');
          });

          it('has all groups selected', () => {
            expect(page.groupSelect.dropdownText).to.be.equal('All groups');
          });

        });

      });

    });

  });

});