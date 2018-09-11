
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit } from '@bigtest/react';
import { expect } from 'chai';

import { 
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication, fakeAuth0Id 
} from 'tests/helpers';

import app from 'tests/helpers/pages/app';
import switcher from '@ui/components/sidebar/org-switcher/__tests__/page';
import page from './page';

describe('Acceptance | User list | Filtering users by organization', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('User belongs multiple organizations', () => {

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
        }
      ]
    });

    beforeEach(function () {
      const { server } = this.polly;
      
      server.get('/api/users').intercept((req, res) => {
        const orgHeader = req.getHeader('Organization');

        res.status(200);
        res.headers['Content-Type'] = 'application/vnd.api+json';

        if (orgHeader === '') {
          res.json({
            data: [{
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
        } else if (orgHeader === '1') {
          res.json({
            data: [{
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
          throw "Unexpected Header Value";
        }
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
            await switcher.chooseOrganization("SIL International");
          });

          it('Only display the users that belong to the selected organization', () => {
            console.log(page.usernames());
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
