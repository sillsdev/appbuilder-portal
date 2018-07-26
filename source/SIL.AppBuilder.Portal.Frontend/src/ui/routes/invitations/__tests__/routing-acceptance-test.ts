import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication
} from 'tests/helpers/index';

import app from 'tests/helpers/pages/app';

describe('Acceptance | Invitations | routing', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, '/organizations', { data: [{
      type: 'organizations',
      id: 1,
      attributes: {}
    }] });
  });

  describe('navigates to /invitations', () => {
    beforeEach(async () => {
      await visit('/invitations');
    });

    it('displays that the path is not found', () => {
      expect(app.headers).to.contain('Not Found!');
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq('/invitations');
    });
  });

  describe('navigates to /invitations/organization', () => {
    beforeEach(async () => {
      await visit('/invitations/organization');
    });

    it('displays that the path is not found', () => {
      expect(app.headers).to.contain('Not Found!');
    });

    it('maintains the URL (no redirect)', () => {
      expect(location().pathname).to.eq('/invitations/organization');
    });
  });

  describe('navigates to an invitation', () => {
    beforeEach(async () => {
      await visit('/invitations/organization/something');
    });

    it('should not say that the path was not found', () => {
      expect(app.headers).to.not.contain('Not Found!');
    });

    it('should not redirect', () => {
      expect(location().pathname).to.eq('/invitations/organization/something');
    });
  });
});
