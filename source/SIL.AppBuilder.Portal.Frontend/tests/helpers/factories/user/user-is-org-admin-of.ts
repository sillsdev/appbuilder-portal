import { roles, userRoleFrom } from 'tests/helpers/fixtures';
import { fakeAuth0Id } from 'tests/helpers/jwt';

export function userIsOrgAdminOf(organizationResource) {
  const { id: orgId } = organizationResource;

  return {
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
          organization: { data: { id: orgId, type: 'organizations' } }
        }
      },
      {
        type: 'organizations',
        id: 1,
        attributes: { name: 'DeveloperTown' }
      },
      {
        id: 1,
        type: 'groups' ,
        attributes: { name: 'Some Group' },
        relationships: {
          organization: { data: { id: orgId, type: 'organizations' } }
        }
      },
      userRoleFrom(roles.orgAdmin, { id: 1, userId: 1, orgId }),
      roles.orgAdmin,
    ]
  };
}
