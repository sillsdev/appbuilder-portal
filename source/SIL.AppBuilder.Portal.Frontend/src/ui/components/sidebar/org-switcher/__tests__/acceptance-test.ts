import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, useFakeAuthentication,
  setupRequestInterceptor, fakeAuth0Id
} from 'tests/helpers/index';

import app from 'tests/helpers/pages/app';
import switcher from './page';

async function makeOrgSwitcherVisible() {
  await visit('/');
  expect(location().pathname).to.eq('/');

  await app.openSidebar();
  expect(app.isSidebarVisible).to.be.true;

  await app.openOrgSwitcher();
  expect(app.isOrgSwitcherVisible).to.be.true;
}
const lotsOfOrgs = [
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
  }, {
    type: 'organizations', id: 3,
    attributes: {
      name: 'Kalaam Media'
    }
  }, {
    type: 'organizations', id: 4,
    attributes: {
      name: 'The Ember Learning Team'
    }
  }, {
    type: 'organizations', id: 5,
    attributes: {
      name: 'Blizzard Entertainment'
    }
  }, {
    type: 'organizations', id: 5,
    attributes: {
      name: 'Linkedin'
    }
  }
];

const threeOrgs = [
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
  }, {
    type: 'organizations', id: 3,
    attributes: {
      name: 'Kalaam Media'
    }
  }
];

const scenarios = {
  userIsInLotsOfOrganizations() {
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
          id: 2,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 2, type: 'organizations' } }
          }
        },
        {
          id: 3,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 3, type: 'organizations' } }
          }
        },
        {
          id: 4,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 4, type: 'organizations' } }
          }
        },
        {
          id: 5,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 4, type: 'organizations' } }
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
        ...lotsOfOrgs
      ]
    });
  },
  userIsIn3Organizations() {
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
          id: 2,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 2, type: 'organizations' } }
          }
        },
        {
          id: 3,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 3, type: 'organizations' } }
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
        ...threeOrgs
      ]
    });
  }
};

describe('Acceptance | Organization Switcher', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('The Current User is a member of multiple organizations', () => {
    scenarios.userIsIn3Organizations();

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [...threeOrgs]
      });
    });

    beforeEach(async () => {
      await makeOrgSwitcherVisible();
    });

    it('does not show the search field', () => {
      expect(switcher.isSearchVisible).to.be.false;
    });

    it('renders each organization by name', () => {
      const nodes = switcher.orgNames;
      const text = nodes.map(t => t.innerText).join();

      expect(text).to.include('SIL International');
      expect(text).to.include('DeveloperTown');
      expect(text).to.include('Kalaam Media');
    });

    describe('Selecting an organization', () => {
      beforeEach(async () => {
        await switcher.selectOrg();
      });

      it('hides the org switcher', () => {
        // expect(switcher.selectedOrg).to.equal("SIL International");

        expect(app.isOrgSwitcherVisible).to.be.false;
      });
    });
  });

  describe('The current user is a member of lots of organizations', () => {
    scenarios.userIsInLotsOfOrganizations();

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [...lotsOfOrgs]
      });
    });

    beforeEach(async () => {
      await makeOrgSwitcherVisible();
    });

    it('shows the search field', () => {
      expect(switcher.isSearchVisible).to.be.true;
    });
  });
});
