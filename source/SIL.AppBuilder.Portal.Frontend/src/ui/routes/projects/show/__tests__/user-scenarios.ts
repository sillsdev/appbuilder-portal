import { useFakeAuthentication, fakeAuth0Id } from 'tests/helpers/index';
import { roles, userRoleFrom } from 'tests/helpers/fixtures';

const groups = [
  {
    id: 1,
    type: 'groups',
    attributes: { name: 'Group 1' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } },
    },
  },
  {
    id: 2,
    type: 'groups',
    attributes: { name: 'Group 2' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } },
    },
  },
  {
    id: 3,
    type: 'groups',
    attributes: { name: 'Group 3' },
    relationships: {
      owner: { data: { id: 1, type: 'organizations' } },
    },
  },
];

export function userInDifferentOrganization(orgId: number) {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    },
    included: [
      {
        id: 1,
        type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: orgId, type: 'organizations' } },
        },
      },
      {
        id: 2,
        type: 'organizations',
        attributes: {},
        relationships: {
          ['organization-memberships']: {
            data: [{ id: 1, type: 'organization-memberships' }],
          },
        },
      },
      ...groups,
      userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId }),
      roles.orgAdmin,
    ],
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
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['group-memberships']: {
          data: [{ id: 2, type: 'group-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    },
    included: [
      {
        id: 1,
        type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: orgId, type: 'organizations' } },
        },
      },
      {
        id: 2,
        type: 'group-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          group: { data: { id: groupId, type: 'group' } },
        },
      },
      ...groups,
      userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId }),
      roles.orgAdmin,
    ],
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
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['group-memberships']: {
          data: [{ id: 1, type: 'group-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    },
    included: [
      {
        id: 1,
        type: 'organization-memberships',
        attributes: {},
        relationships: {
          user: { data: { id: 1, type: 'users' } },
          organization: { data: { id: orgId, type: 'organizations' } },
        },
      },
      {
        type: 'group-memberships',
        id: 4,
        attributes: {},
        relationships: {
          group: { data: { id: 1, type: 'groups' } },
          user: { data: { id: 1, type: 'users' } },
        },
      },
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
      {
        id: 3,
        type: 'groups',
        attributes: { name: 'Group 3' },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
        },
      },
      ...groups,
      userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId }),
      roles.orgAdmin,
    ],
  });
}

export function currentUserIsOrgAdmin({ orgId }) {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
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
        type: 'user-roles',
        attributes: { roleName: 'OrganizationAdmin' },
        relationships: {
          ['user']: { data: { id: 1, type: 'users' } },
          ['role']: { data: { id: 2, type: 'roles' } },
          ['organization']: { data: { id: orgId, type: 'organizations' } },
        },
      },
      {
        id: 2,
        type: 'roles',
        attributes: { roleName: 'OrganizationAdmin' },
      },
    ],
  });
}

export function currentUserHasNoRoles() {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
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
    ],
  });
}

export function currentUserIsSuperAdmin() {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
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
        type: 'user-roles',
        attributes: { roleName: 'SuperAdmin' },
        relationships: {
          ['user']: { data: { id: 1, type: 'users' } },
          ['role']: { data: { id: 1, type: 'roles' } },
          ['organization']: { data: { id: 1, type: 'organizations' } },
        },
      },
      {
        id: 1,
        type: 'roles',
        attributes: { roleName: 'SuperAdmin' },
      },
    ],
  });
}

export function currentUserIsAppBuilder() {
  useFakeAuthentication({
    data: {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: { data: [{ id: 1, type: 'organization-memberships' }] },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
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
        type: 'user-roles',
        attributes: { roleName: 'AppBuilder' },
        relationships: {
          ['user']: { data: { id: 1, type: 'users' } },
          ['role']: { data: { id: 3, type: 'roles' } },
          ['organization']: { data: { id: 1, type: 'organizations' } },
        },
      },
      {
        id: 3,
        type: 'roles',
        attributes: { roleName: 'AppBuilder' },
      },
    ],
  });
}

export function currentUserOwnsProject(projectName: string) {
  beforeEach(function() {
    this.mockGet(200, 'projects/1', {
      data: {
        type: 'projects',
        id: '1',
        attributes: { name: projectName },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 1, type: 'users' } },
        },
      },
      included: [
        { type: 'organizations', id: 1 },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
        { type: 'users', id: 1, attributes: { familyName: 'last', givenName: 'first' } },
      ],
    });

    this.mockGet(200, 'groups', { data: [] });
    this.mockGet(200, 'users', { data: [] });
  });
}

export function currentUserDoesNotOwnProject(projectName: string) {
  beforeEach(function() {
    this.mockGet(200, 'projects/1', {
      data: {
        type: 'projects',
        id: '1',
        attributes: { name: projectName },
        relationships: {
          organization: { data: { id: 1, type: 'organizations' } },
          group: { data: { id: 1, type: 'groups' } },
          owner: { data: { id: 2, type: 'users' } },
        },
      },
      included: [
        { type: 'organizations', id: 1 },
        { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
        { type: 'users', id: 2, attributes: { familyName: 'last', givenName: 'first' } },
      ],
    });

    this.mockGet(200, 'groups', { data: [] });
    this.mockGet(200, 'users', { data: [] });
  });
}
