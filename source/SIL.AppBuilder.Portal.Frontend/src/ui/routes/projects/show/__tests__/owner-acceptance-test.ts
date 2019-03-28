import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
  fakeAuth0Id,
} from 'tests/helpers/index';

import { userInSameOrgDifferentGroup, userInSameOrgAndGroup } from './user-scenarios';
import page from './page';

function setupMockData() {
  beforeEach(function() {
    this.mockGet(200, 'projects/1', {
      data: {
        type: 'projects',
        id: '1',
        attributes: { name: 'some project' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 2, type: 'users' } },
        },
      },
      included: [
        { type: 'organizations', id: 1 },
        { type: 'groups', id: 1, attributes: { name: 'Group 1' } },
        { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
      ],
    });

    this.mockGet(200, 'groups', {
      data: [
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Group 1' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          id: 2,
          type: 'groups',
          attributes: { name: 'Group 2' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
      ],
    });

    this.mockGet(200, 'users', {
      data: [
        {
          type: 'users',
          id: 1,
          attributes: { familyName: 'fake', givenName: 'fake' },
          relationships: {
            ['organization-memberships']: {
              data: [{ id: 1, type: 'organization-memberships' }],
            },
            ['group-memberships']: {
              data: [{ id: 4, type: 'group-membership' }],
            },
          },
        },
        {
          type: 'users',
          id: 2,
          attributes: { familyName: 'last', givenName: 'first' },
          relationships: {
            ['organization-memberships']: {
              data: [{ id: 2, type: 'organization-memberships' }],
            },
            ['group-memberships']: {
              data: [{ id: 5, type: 'group-membership' }],
            },
          },
        },
        {
          type: 'users',
          id: 3,
          attributes: { familyName: 'last3', givenName: 'first3' },
          relationships: {
            ['organization-memberships']: {
              data: [{ id: 3, type: 'organization-memberships' }],
            },
            ['group-memberships']: {
              data: [{ id: 6, type: 'group-membership' }],
            },
          },
        },
        {
          type: 'users',
          id: 4,
          attributes: { familyName: 'last4', givenName: 'first4' },
          relationships: {
            ['organization-memberships']: {
              data: [{ id: 4, type: 'organization-memberships' }],
            },
            ['group-memberships']: {
              data: [{ id: 7, type: 'group-membership' }],
            },
          },
        },
      ],
      included: [
        // { type: 'group-memberships', id: 4, attributes: {}, relationships: {
        //   group: { data: { id: 1, type: 'groups' } },
        //   user: { data: { id: 1, type: 'users' } }
        // } },
        {
          type: 'group-memberships',
          id: 5,
          attributes: {},
          relationships: {
            group: { data: { id: 1, type: 'groups' } },
            user: { data: { id: 2, type: 'users' } },
          },
        },
        {
          type: 'group-memberships',
          id: 6,
          attributes: {},
          relationships: {
            group: { data: { id: 1, type: 'groups' } },
            user: { data: { id: 3, type: 'users' } },
          },
        },
        {
          type: 'group-memberships',
          id: 7,
          attributes: {},
          relationships: {
            group: { data: { id: 2, type: 'groups' } },
            user: { data: { id: 4, type: 'users' } },
          },
        },
        {
          type: 'organization-memberships',
          id: 1,
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          type: 'organization-memberships',
          id: 2,
          attributes: {},
          relationships: {
            user: { data: { id: 2, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          type: 'organization-memberships',
          id: 3,
          attributes: {},
          relationships: {
            user: { data: { id: 3, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          type: 'organization-memberships',
          id: 4,
          attributes: {},
          relationships: {
            user: { data: { id: 4, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
      ],
    });
  });
}

describe('Acceptance | Project Edit | re-assigning the owner', () => {
  describe('the user is not in the same group as the project', () => {
    userInSameOrgDifferentGroup(1, 2);
    setupApplicationTest();
    setupMockData();

    beforeEach(async function() {
      await visit('/projects/1');
      await when(() => page.hasUserSelect);
    });

    it('defaults to the project owner', () => {
      expect(page.userSelect.selectedUser).to.equal('first last');
    });

    it('does not allow the user to change the owner', () => {
      expect(page.userSelect.isDisabled).to.be.true;
    });
  });

  describe('the user is in the same group as the project', () => {
    userInSameOrgAndGroup(1, 1);
    setupApplicationTest();
    setupMockData();

    beforeEach(async function() {
      await visit('/projects/1');
      await when(() => page.hasUserSelect);
    });

    it('defaults to the project owner', () => {
      expect(page.userSelect.selectedUser).to.equal('first last');
    });

    it('allows the user to change the owner', () => {
      expect(page.userSelect.isDisabled).to.be.false;
    });

    it('shows all the users within the group that are in the org', () => {
      const options = page.userSelect.options();
      const optionsText = options.map((o) => o.text).join();

      expect(optionsText).to.contain('fake fake');
      expect(optionsText).to.contain('first last');
    });

    it('does not show users outside the group', () => {
      const options = page.userSelect.options();
      const optionsText = options.map((o) => o.text).join();

      expect(optionsText).to.not.contain('first4 last4');
    });
  });
});
