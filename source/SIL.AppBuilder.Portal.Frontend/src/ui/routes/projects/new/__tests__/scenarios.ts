import { useFakeAuthentication, fakeAuth0Id } from 'tests/helpers/index';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';


const groups = [
  { id: 1, type: 'groups' ,
    attributes: { name: 'Group 1' },
    relationships: {
      owner: { data: { id: 2, type: 'organizations' } }
    }
  },
];

export const organizations = [
  { id: 1, type: 'organizations',
    attributes: { name: 'DeveloperTown' },
  },
  { id: 2, type: 'organizations',
    attributes: { name: 'SIL' },
  }
];

export function userInTwoOrganizationsAndNoGroups() {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [
            { id: 1, type: 'organization-memberships' },
            { id: 2, type: 'organization-memberships' },
          ]
        },
        ['user-roles']: { data: [{  id: 1, type: 'user-roles' } ] },
      }
    },
    included: [
      { id: 1, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: 1, type: 'organizations' } }
      }},
      { id: 2, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: 2, type: 'organizations' } }
      }},
      userRoleFrom(roles.superAdmin, { id: 1, userId: 1, orgId: 2 }),
      roles.superAdmin,
      ...organizations
    ]
  });

}

export function userInTwoOrganizationsButOnlyOneGroup() {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [
            { id: 1, type: 'organization-memberships' },
            { id: 2, type: 'organization-memberships' },
          ]
        },
        ['user-roles']: { data: [{  id: 1, type: 'user-roles' } ] },
        ['group-memberships']: {
          data: [
            { id: 1, type: 'group-memberships' }
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
      { id: 2, type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: 2, type: 'organizations' } }
      }},
      { id: 1, type: 'group-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' }},
          group: { data: { id: 1, type: 'groups' }},
      }},
      ...groups,
      userRoleFrom(roles.superAdmin, { id: 1, userId: 1, orgId: 2 }),
      roles.superAdmin,
      ...organizations
    ]
  });
}