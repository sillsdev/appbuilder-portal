import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers';

import page from './page';

describe('Acceptance | User groups', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('In users page', () => {

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
            'group-memberships': {
              data: [{
                type: 'group-memberships', id: 2
              },{
                type: 'group-memberships', id: 3
              }]
            },
            'organization-memberships': {
              data: [{
                type: 'organization-memberships', id: 2
              }]
            }
          }
        }],
        included: [{
          type: 'organization-memberships',
          id: 2,
          relationships: {
            organization: { data: { type: 'organization', id: 1}},
            user: { data: { type: 'user', id: 2}}
          }
        },{
          type: 'group-memberships',
          id: 2,
          relationships: {
            group: { data: { type: 'groups', id: 1}},
            user: { data: { type: 'users', id: 2}}
          }
        },{
          type: 'group-memberships',
          id: 3,
          relationships: {
            group: { data: { type: 'groups', id: 2}},
            user: { data: { type: 'users', id: 2}}
          }
        },{
          type: 'groups',
          id: 1,
          attributes: { name:'Fake group', abbreviation: 'FG'},
          relationships: {
            owner: { data: { type: 'organizations', id: 1}}
          }
        },{
          type: 'groups',
          id: 2,
          attributes: { name: 'Another Fake group', abbreviation: 'AFG' },
          relationships: {
            owner: { data: { type: 'organizations', id: 1}}
          }
        }]
      });
    });

    beforeEach(async function () {
      await visit('/users');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    it('two groups are selected', () => {
      expect(page.groupDropdownText).to.equal('Fake group, Another Fake group');
    });

    describe('remove user from all groups',() => {

      beforeEach(function() {
        this.mockDelete(204,'group-memberships/2');
        this.mockDelete(204,'group-memberships/3');
      });

      beforeEach(async function() {
        await page.groupDropdownCheckboxes(0).click();
        await page.groupDropdownCheckboxes(1).click();
      });

      it('None is displayed',() => {
        expect(page.groupDropdownText).to.equal('None');
      });

      describe('add one group back', () => {

        beforeEach(function() {
          this.mockPost(201,'group-memberships',{
            data: {
              attributes: { },
              id: 2,
              type: 'group-memberships',
              relationships: {
                group: { data: { id: 1, type: 'groups' } },
                user: { data: { id: 1, type: 'users' } }
              }
            }
          });
        });

        beforeEach(async function() {
          await page.groupDropdownCheckboxes(0).click();
        });

        it('First group is displayed', () => {
          expect(page.groupDropdownText).to.equal('Fake group');
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
            'group-memberships': {
              data: [
                { type: 'group-memberships', id: 4},
                { type: 'group-memberships', id: 5},
                { type: 'group-memberships', id: 6}
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
        included: [{
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
        }, {
          type: 'group-memberships',
          id: 4,
          relationships: {
            group: { data: { type: 'groups', id: 1 } },
            user: { data: { type: 'users', id: 2 } }
          }
        }, {
          type: 'group-memberships',
          id: 5,
          relationships: {
            group: { data: { type: 'groups', id: 2 } },
            user: { data: { type: 'users', id: 2 } }
          }
        }, {
          type: 'group-memberships',
          id: 6,
          relationships: {
            group: { data: {type: 'groups', id: 3}},
            user: { data: { type: 'users', id: 2}}
          }
        }, {
          type: 'groups',
          id: 1,
          attributes: { name: 'Fake group', abbreviation: 'FG' },
          relationships: {
            owner: { data: { type: 'organizations', id: 1 } }
          }
        }, {
          type: 'groups',
          id: 2,
          attributes: { name: 'Another Fake group', abbreviation: 'AFG' },
          relationships: {
            owner: { data: { type: 'organizations', id: 1 } }
          }
        }, {
          type: 'groups',
          id: 3,
          attributes: { name: 'SIL fake group', abbreviation: 'SFG' },
          relationships: {
            owner: { data: { type: 'organizations', id: 2 } }
          }
        }]
      });
    });

    describe('Current user belongs to one organization', () => {
      useFakeAuthentication();

      beforeEach(async function () {
        await visit('/users');
      });

      it('does not render second organization',() => {
        const orgNames = page.groupDropdownOrganizationName().map(item => item.text);
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
          {
            id: 1, type: 'user-roles',
            attributes: { roleName: 'SuperAdmin' },
            relationships: {
              ['user']: { data: { id: 1, type: 'users' } },
              ['role']: { data: { id: 1, type: 'roles' } },
              ['organization']: { data: { id: 1, type: 'organizations' } }
            }
          },
          {
            id: 1, type: 'roles',
            attributes: { roleName: 'SuperAdmin' }
          }
        ]
      });

      beforeEach(async function () {
        await visit('/users');
      });

      it('renders two organizations groups',() => {
        expect(page.groupDropdownText).to.equal('Fake group, Another Fake group, SIL fake group');
      });

    });
  });
});