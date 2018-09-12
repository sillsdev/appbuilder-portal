import { useFakeAuthentication, fakeAuth0Id } from 'tests/helpers/index';


const groups = [
  { id: 1, type: 'groups' ,
    attributes: { name: 'Group 1' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } }
    }
  },
  { id: 2, type: 'groups' ,
    attributes: { name: 'Group 2' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } }
    }
  },
  { id: 3, type: 'groups' ,
    attributes: { name: 'Group 3' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } }
    }
  }
];

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
      },
      ...groups
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
      },
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
      },
      ...groups
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
      },
      ...groups
    ]
  });
}
