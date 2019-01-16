import { useFakeAuthentication, fakeAuth0Id } from 'tests/helpers/index';
import { beforeEach } from '@bigtest/mocha';

export const lotsOfOrgs = [
  {
    type: 'organizations',
    id: 1,
    attributes: {
      name: 'SIL International',
    },
  },
  {
    type: 'organizations',
    id: 2,
    attributes: {
      name: 'DeveloperTown',
    },
  },
  {
    type: 'organizations',
    id: 3,
    attributes: {
      name: 'Kalaam Media',
    },
  },
  {
    type: 'organizations',
    id: 4,
    attributes: {
      name: 'The Ember Learning Team',
    },
  },
  {
    type: 'organizations',
    id: 5,
    attributes: {
      name: 'Blizzard Entertainment',
    },
  },
  {
    type: 'organizations',
    id: 5,
    attributes: {
      name: 'Linkedin',
    },
  },
];

export const threeOrgs = [
  {
    type: 'organizations',
    id: 1,
    attributes: {
      name: 'SIL International',
    },
  },
  {
    type: 'organizations',
    id: 2,
    attributes: {
      name: 'DeveloperTown',
    },
  },
  {
    type: 'organizations',
    id: 3,
    attributes: {
      name: 'Kalaam Media',
    },
  },
];

export const oneOrg = [
  {
    type: 'organizations',
    id: 1,
    attributes: {
      name: 'SIL International',
    },
  },
];

export default {
  userIsInOneOrganization() {
    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
        relationships: {
          ['organization-memberships']: {
            data: [{ id: 1, type: 'organization-memberships' }],
          },
        },
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Some Group' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        ...oneOrg,
      ],
    });

    beforeEach(function() {
      this.mockGet(200, '/organizations', {
        data: [...oneOrg],
      });
    });
  },
  userIsInLotsOfOrganizations() {
    useFakeAuthentication({
      data: {
        id: 1,
        type: 'users',
        attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
        relationships: {
          ['organization-memberships']: {
            data: [{ id: 1, type: 'organization-memberships' }],
          },
        },
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          id: 2,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 2, type: 'organizations' } },
          },
        },
        {
          id: 3,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 3, type: 'organizations' } },
          },
        },
        {
          id: 4,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 4, type: 'organizations' } },
          },
        },
        {
          id: 5,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 4, type: 'organizations' } },
          },
        },
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Some Group' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        ...lotsOfOrgs,
      ],
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
            data: [{ id: 1, type: 'organization-memberships' }],
          },
        },
      },
      included: [
        {
          id: 1,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        {
          id: 2,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 2, type: 'organizations' } },
          },
        },
        {
          id: 3,
          type: 'organization-memberships',
          attributes: {},
          relationships: {
            user: { data: { id: 1, type: 'users' } },
            organization: { data: { id: 3, type: 'organizations' } },
          },
        },
        {
          id: 1,
          type: 'groups',
          attributes: { name: 'Some Group' },
          relationships: {
            organization: { data: { id: 1, type: 'organizations' } },
          },
        },
        ...threeOrgs,
      ],
    });
  },
};
