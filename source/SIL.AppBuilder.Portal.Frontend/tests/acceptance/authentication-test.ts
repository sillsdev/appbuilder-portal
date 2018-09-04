import { describe, it, beforeEach, afterEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, respondWithJsonApi } from 'tests/helpers/index';
import { fakeAuth0JWT, fakeAuth0Id } from 'tests/helpers/jwt';

import { setToken, deleteToken, isLoggedIn } from '@lib/auth0';

import app from 'tests/helpers/pages/app';

// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Acceptance | Authentication', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('is authenticated', () => {
    beforeEach(function() {
      const { server } = this.polly;

      setToken(fakeAuth0JWT());

      server.get('/api/users/current-user').intercept(respondWithJsonApi(200, {
        data: {
          id: 1,
          type: 'users',
          attributes: { id: 1, auth0Id: fakeAuth0Id },
          relationships: {
            ['organization-memberships']: {
              data: [
                { id: 1, type: 'organization-memberships' },
              ]
            }
          }
        },
        included: [
          { type: 'organization-memberships', id: 1, attributes: {},
            relationships: {
              organization: { data: { id: 1, type: 'organizations' } },
              user: { data: { id: 1, type: 'users' } }
            }},
          { type: 'organizations', id: 1, attributes: {} }
        ]
      }));

      expect(isLoggedIn()).to.be.true;
    });

    afterEach(() => {
      deleteToken();
    });

    describe('logging out', () => {
      beforeEach(async function() {
        await visit('/tasks');
        await app.clickLogout();
      });

      it('is logged out', () => {
        expect(isLoggedIn()).to.be.false;
      });

      it('is redirected to login', () => {
        expect(location().pathname).to.equal('/login');
      });
    });

    describe('navigates to a route that requires authentication', () => {
      beforeEach(async function() {
        await visit('/invitations');
      });

      it('is allowed', () => {
        expect(location().pathname).to.equal('/invitations');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      beforeEach(async () => {
        await visit('/not-found');
      });

      it('it is allowed', () => {
        expect(location().pathname).to.equal('/not-found');
      });
    });

    describe('navigates to a route that requires no authentication', () => {
      beforeEach(async function() {
        await visit('/login');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/');
      });
    });
  });

  describe('is not authenticated', () => {
    beforeEach(function() {
      deleteToken();
    });

    describe('navigates to a route that requires authentication', () => {
      beforeEach(async function() {
        await visit('/invitations');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/login');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      beforeEach(async () => {
        await visit('/not-found');
      });

      it('it is allowed', () => {
        expect(location().pathname).to.equal('/not-found');
      });
    });

    describe('navigates to a route that requires no authentication', () => {
      beforeEach(async () => {
        await visit('/login');
      });

      it('is allowed access', () => {
        expect(location().pathname).to.equal('/login');
      });
    });
  });

});
