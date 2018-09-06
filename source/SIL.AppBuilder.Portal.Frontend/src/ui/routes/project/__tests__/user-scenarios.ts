import { useFakeAuthentication, fakeAuth0Id } from 'tests/helpers/index';

export function userInDifferentOrganization(orgId: number) {
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
      { id: 1, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: orgId, type: 'organizations' } }
      }},
      { id: 2, type: 'organizations',
        attributes: {},
        relationships: {
          ['organization-memberships']: {
            data: [
              { id: 1, type: 'organization-memberships' }
            ]
          }
        }
      }
    ]
  });
}


export function userInSameOrgDifferentGroup(orgId, groupId) {
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
            { id: 2, type: 'group-memberships' },
          ]
        }
      }
    },
    included: [
      { id: 1, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: orgId, type: 'organizations' } }
      }},
      { id: 2, type: 'group-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          group: { data: { id: groupId, type: 'group' } }
        }
      }
    ]
  });
}

export function userInSameOrgAndGroup(orgId, groupId) {
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
          organization: { data: { id: orgId, type: 'organizations' } }
      }},
      { type: 'group-memberships', id: 4, attributes: {}, relationships: {
        group: { data: { id: 1, type: 'groups' } },
        user: { data: { id: 1, type: 'users' } }
      } },
    ]
  });
}
