import { describe, it, beforeEach, afterEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect, assert } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  respondWithJsonApi,
  wait,
  resetBrowser,
  useFakeAuthentication,
} from 'tests/helpers/index';
import { fakeAuth0JWT, fakeAuth0Id } from 'tests/helpers/jwt';
import { setToken, deleteToken, isLoggedIn } from '@lib/auth0';
import app from 'tests/helpers/pages/app';

let user = {
  data: {
    id: 1,
    type: 'users',
    attributes: { id: 1, auth0Id: fakeAuth0Id },
    relationships: {
      ['organization-memberships']: {
        data: [{ id: 1, type: 'organization-memberships' }],
      },
    },
  },
  included: [
    {
      type: 'organization-memberships',
      id: 1,
      attributes: {},
      relationships: {
        organization: { data: { id: 1, type: 'organizations' } },
        user: { data: { id: 1, type: 'users' } },
      },
    },
    { type: 'organizations', id: 1, attributes: {} },
  ],
};

// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Acceptance | Authentication', () => {
  resetBrowser();

  describe('authenticated with user that does not have a verified email', () => {
    setupRequestInterceptor();
    setupApplicationTest();

    beforeEach(async function() {
      const { server } = this.polly;

      setToken(fakeAuth0JWT({ ['email_verified']: false }));

      server.get('/api/users/current-user').intercept(respondWithJsonApi(200, user));

      await visit('/tasks');
    });

    it('redirects to verify email', () => {
      expect(location().pathname).to.equal('/verify-email');
    });
  });

  describe('is authenticated', () => {
    useFakeAuthentication();
    setupApplicationTest();

    describe('logging out', () => {
      beforeEach(async function() {
        await visit('/tasks');
        await when(() => assert(app.isLogoutPresent, 'logout button should be available'));
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
        await visit('/tasks');
      });

      it('is allowed', () => {
        expect(location().pathname).to.equal('/tasks');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      beforeEach(async () => {
        await visit('/open-source');
      });

      it('it is allowed', () => {
        expect(location().pathname).to.equal('/open-source');
      });
    });

    describe('navigates to a route that requires no authentication', () => {
      beforeEach(async function() {
        await visit('/login');

        await when(() =>
          assert(
            !document.querySelector('[data-test-login-page]'),
            `expected to not find the auth0 lock widget.`
          )
        );
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/tasks');
      });
    });
  });

  describe('is not authenticated', () => {
    setupRequestInterceptor();
    setupApplicationTest();

    beforeEach(function() {
      deleteToken();
    });

    describe('navigates to a route that requires authentication', () => {
      beforeEach(async function() {
        await visit('/tasks');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/login');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      beforeEach(async () => {
        await visit('/open-source');
      });

      it('it is allowed', () => {
        expect(location().pathname).to.equal('/open-source');
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
