
import { when } from '@bigtest/convergence';

import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication, fakeAuth0Id, wait,
  switchToOrg
} from 'tests/helpers';

import app from 'tests/helpers/pages/app';
import switcher from '@ui/components/sidebar/org-switcher/__tests__/page';
import UserTableInteractor from './-user-table';
let userTable = null;
describe('Acceptance | User list | Filtering users by organization', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [
            { id: 1, type: 'organization-memberships' },
            { id: 4, type: 'organization-memberships' }
          ]
        },
        ['user-roles']: { data: [ { id: 1, type: 'user-roles' } ] },
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
        id: 4, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
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
      },
      {
        id: 1,
        type: 'groups' ,
        attributes: { name: 'Some Group' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } }
        }
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

  describe('User belongs multiple organizations', () => {
    beforeEach(function () {
      const { server } = this.polly;

      server.get('/api/users').intercept((req, res) => {
        const orgHeader = req.getHeader('organization');

        res.status(200);
        res.headers['Content-Type'] = 'application/vnd.api+json';

        const allOrganizations = !orgHeader || orgHeader === 'null' || orgHeader === '';
        const selectedOrganization = orgHeader === '1';

        if (allOrganizations) {
          res.json({
            data: [{
              id: 1,
              type: 'users',
              attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
              relationships: {
                ['organization-memberships']: { data: [ { id: 1, type: 'organization-memberships' }]}
              }
            }, {
              type: 'users',
              id: 2,
              attributes: { familyName: 'fake', givenName: 'One' },
              relationships: {
                ['organization-memberships']: { data: [ { id: 2, type: 'organization-memberships' }]},
                "group-memberships": {}
              }
            }, {
              type: 'users',
              id: 3,
              attributes: { familyName: 'fake', givenName: 'Two' },
              relationships: {
                ['organization-memberships']: { data: [ { id: 3, type: 'organization-memberships' }]},
                "group-memberships": {}
              },
            }],
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
        } else if (selectedOrganization) {
          res.json({
            data: [{
              id: 1,
              type: 'users',
              attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
              relationships: {
                ['organization-memberships']: { data: [ { id: 1, type: 'organization-memberships' }]}
              }
            }, {
              type: 'users',
              id: 2,
              attributes: { familyName: 'fake', givenName: 'One' },
              relationships: {
                ['organization-memberships']: { data: [ { id: 2, type: 'organization-memberships' }]},
                "group-memberships": {}
              }
            }],
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
                id: 2, type: 'organization-memberships',
                attributes: {},
                relationships: {
                  user: { data: { id: 2, type: 'users' } },
                  organization: { data: { id: 1, type: 'organizations' } }
                }
              },
              {
                type: 'organizations', id: 1,
                attributes: {
                  name: 'SIL International'
                }
              }
            ]
          });
        } else {
          throw new Error(`Unexpected Header Value: ${orgHeader}. Available: ${Object.keys(req.headers).join()}`);
        }
      });
    });

    describe('Select all organizations',() => {
      beforeEach(async function () {
        await visit('/users');
        userTable = new UserTableInteractor();

        await app.openSidebar();
        await app.openOrgSwitcher();
        await switcher.selectAllOrg();

        expect(app.selectedOrg).to.equal("All Organizations");
        visit('/users');
        await when( () => userTable.isPresent);
      });

      describe('Renders users page', () => {
        it('Should see all users', () => {
          expect(userTable.usernames().length).to.equal(3);

          const usernames = userTable.usernames();
          const text = usernames.map(u => u.text).join();

          expect(text).to.include('fake fake');
          expect(text).to.include('One fake');
          expect(text).to.include('Two fake');
        });

        describe('Select a specific organization', () => {
          beforeEach(async function () {
            await switchToOrg('SIL International');
            await when(() => location().pathname === '/tasks');

            visit('/users');
            await when(() => location().pathname === '/users');
            await when(() => userTable.isPresent);
          });

          it('Only display the users that belong to the selected organization', () => {
            expect(userTable.usernames().length).to.equal(2);

            const usernames = userTable.usernames();
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
