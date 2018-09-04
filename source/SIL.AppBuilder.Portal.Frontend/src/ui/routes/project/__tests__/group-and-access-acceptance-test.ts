
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication,
  fakeAuth0Id
} from 'tests/helpers/index';

import {
  userInDifferentOrganization,
  userInSameOrgDifferentGroup,
  userInSameOrgAndGroup
} from './user-scenarios';

import page from './page';

describe('Acceptance | Project Edit | re-assigning the group', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  beforeEach(function() {
    this.mockGet(200, 'users', { data: [] });

    this.mockGet(200, 'projects/1', { data: {
        type: 'projects',
        id: '1',
        attributes: { name: 'some project' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 2, type: 'users' } }
        }
      },
      included: [
        { type: 'organizations', id: 1, },
        { type: 'groups', id: 1, attributes: { name: 'Group 1' } },
        { type: 'users' , id: 2, attributes: { familyName: 'last', givenName: 'first' } },
      ]
    });

    this.mockGet(200, 'groups', { data: [
      { id: 1, type: 'groups' ,
        attributes: { name: 'Group 1' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } }
        }
      },
      { id: 2, type: 'groups' ,
        attributes: { name: 'Group 2' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } }
        }
      },
      { id: 3, type: 'groups' ,
        attributes: { name: 'Group 3' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } }
        }
      }
    ] });
  });

  describe('the user is not in the same organization as the project', () => {
    userInDifferentOrganization(2);

    beforeEach(async function() {
      await visit('/project/1');
    });

    it('redirects them away from the project', () => {
      expect(location().pathname).to.not.eq('/project/1');
      expect(location().pathname).to.eq('/');
    });
  });

  describe('the user is in the same organization as the project, but not in the same group', () => {
    userInSameOrgDifferentGroup(1, 2);

    beforeEach(async function() {
      await visit('/project/1');
    });

    it('does not redirect', () => {
      expect(location().pathname).to.eq('/project/1');
    });

    it('shows the group the project is in', () => {
      expect(page.groupSelect.selectedGroup).to.eq('Group 1');
    });

    xit('the group dropdown only has one option', () => {
      expect(page.groupSelect.options.length).to.eq(1);
    });

    it('the group dropdown is disabled', () => {
      expect(page.groupSelect.isDisabled).to.be.true;
    });
  });

  describe('the user is in both the same organization and the same group as the project', () => {
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
          },
          ['group-memberships']: {
            data: [
              { id: 1, type: 'group-memberships' },
            ]
          }
        }
      },
      included: [
        { id: 1, type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } }
        }},
        { id: 1, type: 'group-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            group: { data: { id: 1, type: 'group' } }
          }
        },
        { id: 2, type: 'group-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            group: { data: { id: 3, type: 'group' } }
          }
        }
      ]
    });

    beforeEach(async function() {
      await visit('/project/1');
    });

    it('does not redirect', () => {
      expect(location().pathname).to.eq('/project/1');
    });

    it('defaults to the project group', () => {
      expect(page.groupSelect.selectedGroup).to.eq('Group 1');
    });

    it('allows the user to change the group', () => {
      expect(page.groupSelect.isDisabled).to.be.false;
    });

    it('shows all the users groups for the organization', () => {
      const options = page.groupSelect.options();
      const optionsText = options.map(o => o.text).join();

      expect(optionsText).to.contain('Group 1');
      expect(optionsText).to.contain('Group 3');
      expect(options.length).to.eq(2);
    });

    it('does not show groups the user is not a member of', () => {
      const options = page.groupSelect.options().map(o => o.text).join();

      expect(options).to.not.contain('Group 2');
    });
  });
});
