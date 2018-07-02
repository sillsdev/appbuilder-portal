import { describe, it, beforeEach, afterEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor } from 'tests/helpers/index';
import { fakeAuth0JWT } from 'tests/helpers/jwt';

import { setToken, deleteToken, isLoggedIn } from '@lib/auth0';



// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Acceptance | Authentication', () => {
  setupApplicationTest();
  setupRequestInterceptor();

  describe('is authenticated', () => {
    beforeEach(async () => {
      setToken(fakeAuth0JWT());

      expect(isLoggedIn()).to.be.true;
    });

    afterEach(() => {
      deleteToken();
    });

    describe('navigates to a route that requires authentication', () => {
      beforeEach(async () => {
        await visit('/invitations');
      });

      it('is allowed', () => {
        expect(location().pathname).to.equal('/invitations');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      xit('it is allowed', () => {
        // TODO: need a route that can be viewed by both
        //       authenticated and unauthenticated
      });
    });

    describe('navigates to a route that requires no authentication', () => {
      beforeEach(async () => {
        await visit('/login');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/');
      });
    });
  });

  describe('is not authenticated', () => {
    beforeEach(() => {
      deleteToken();

    });
    describe('navigates to a route that requires authentication', () => {
      beforeEach(async () => {
        await visit('/invitations');
      });

      it('is redirected', () => {
        expect(location().pathname).to.equal('/login');
      });
    });

    describe('navigates to a route that does not require authentication', () => {
      xit('it is allowed', () => {
        // TODO: need a route that can be viewed by both
        //       authenticated and unauthenticated
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
