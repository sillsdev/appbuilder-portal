import { beforeEach, afterEach } from '@bigtest/mocha';
import { expect } from 'chai';

import { fakeAuth0JWT } from './jwt';
import { setToken, deleteToken, isLoggedIn } from '@lib/auth0';

export function useFakeAuthentication() {
  beforeEach(function() {
    setToken(fakeAuth0JWT());

    expect(isLoggedIn()).to.eq(true, 'user should be logged in, but is unauthenticated');
  });

  afterEach(function() {
    deleteToken();

    expect(isLoggedIn()).to.eq(false, 'user should be logged out, but is not');
  });
}
