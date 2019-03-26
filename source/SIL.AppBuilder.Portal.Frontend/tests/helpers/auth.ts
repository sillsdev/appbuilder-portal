import { beforeEach, afterEach } from '@bigtest/mocha';
import { expect } from 'chai';
import { setToken, deleteToken, isLoggedIn, getToken } from '@lib/auth0';

import { fakeAuth0JWT, fakeAuth0Id } from './jwt';
import { respondWithJsonApi } from './request-intercepting/jsonapi';
import { roles, userRoleFrom } from './fixtures';
import { setupRequestInterceptor, setup, teardown } from './request-intercepting/polly';

// this requires the request interceptor
// by default: this user is a super admin
export function useFakeAuthentication(currentUser?: object) {
  beforeEach(function() {
    setup.call(this, {});
    setToken(fakeAuth0JWT());

    expect(isLoggedIn()).to.eq(true, 'user should be logged in, but is unauthenticated');

    const defaultUser = {
      id: 1,
      type: 'users',
      attributes: { id: 1, auth0Id: fakeAuth0Id, familyName: 'fake', givenName: 'fake' },
      relationships: {
        ['organization-memberships']: {
          data: [{ id: 1, type: 'organization-memberships' }],
        },
        ['user-roles']: { data: [{ id: 1, type: 'user-roles' }] },
      },
    };

    const user = (currentUser || {}).data || defaultUser;

    this.currentUser = user;
    // NOTE: current org is currently not extracted from custom user payloads
    this.currentOrganization = {
      type: 'organizations',
      id: 1,
      attributes: { name: 'DeveloperTown' },
    };

    this.mockGet(
      200,
      '/users/current-user',
      currentUser || {
        data: user,
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
          this.currentOrganization,
          {
            id: 1,
            type: 'groups',
            attributes: { name: 'Some Group' },
            relationships: {
              organization: { data: { id: 1, type: 'organizations' } },
            },
          },
          userRoleFrom(roles.superAdmin, { id: 1, userId: 1, orgId: 1 }),
          roles.superAdmin,
        ],
      }
    );
  });

  afterEach(function() {
    deleteToken();

    expect(isLoggedIn()).to.eq(false, 'user should be logged out, but is not');

    teardown.call(this, context);
  });
}
