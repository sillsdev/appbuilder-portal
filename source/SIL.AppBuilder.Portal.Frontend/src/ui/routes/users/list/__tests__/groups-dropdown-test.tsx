import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { fakeAuth0Id } from 'tests/helpers';
import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe('Acceptance | User list | Group dropdown', () => {

  setupApplicationTest();
  setupRequestInterceptor();

  describe('User table renders with empty group dropdown', () => {

    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
        relationships: {
          ['organization-memberships']: {
            data: [
              { id: 1, type: 'organization-memberships' },
            ]
          }
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
          type: 'organizations',
          id: 1,
          attributes: {}
        },
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Some Group' },
          relationships: {
            owner: { data: { id: 1, type: 'organizations' } }
          }
        }
      ]
    });

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
          id: 2,
          attributes: {
            name: 'Fake group one'
          },
          relationships: {
            owner: {
              data: { id: 1, type: "organization" }
            }
          }
        }, {
          type: 'groups',
          id: 3,
          attributes: {
            name: 'Fake group two'
          },
          relationships: {
            owner: {
              data: { id: 2, type: "organization" }
            }
          }
        },{
          type: 'groups',
          id: 4,
          attributes: {
            name: 'Fake group three'
          },
          relationships: {
            owner: {
              data: { id: 2, type: "organization" }
            }
          }
        }],
        included: [{
          type: 'organization',
          id: 1,
          attributes: { name: 'Fake org' }
        },{
          type: 'organization',
          id: 2,
          attributes: { name: 'Other fake org'}
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

      beforeEach(function() {
        this.mockPost(200,'/group-memberships',{
          data: {
            id: 1,
            type: "group-memberships",
            attributes: {},
            relationships: {
              group: { data: { type: 'groups', id: 1 }},
              user: { data: { type: 'groups', id: 1 }}
            }
          }
        });
      });

      beforeEach(async () => {
        await page.groupSelect.clickDropdown();
        await page.groupSelect.chooseGroup('Some Group');
      });

      it('has one group selected',() => {
        expect(page.groupSelect.dropdownText).to.be.equal('Some...');
      });

      describe('Select more than one group', () => {

        beforeEach(async () => {
          await page.groupSelect.chooseGroup('Fake group one');
        });

        xit('has two groups selected',() => {
          expect(page.groupSelect.dropdownText).to.be.equal('Some..., Fake...');
        });

        describe('Select all groups',() => {

          beforeEach(async () => {
            await page.groupSelect.chooseGroup('Fake group two');
            await page.groupSelect.chooseGroup('Fake group three');
          });

          xit('has all groups selected', () => {
            expect(page.groupSelect.dropdownText).to.be.equal('All groups');
          });

        });

      });

    });

  });

});