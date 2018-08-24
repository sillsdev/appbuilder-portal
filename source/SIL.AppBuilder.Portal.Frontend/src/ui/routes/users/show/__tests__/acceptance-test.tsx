import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe('Acceptance | Show User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {

    beforeEach(function () {
      this.mockGet(200, '/users/1', {
        data: [{
          type: 'users',
          id: '1',
          attributes: {
            'family-name': "Fake",
            'given-name': 'User',
            email: 'fake@acme.com'
          }
        }]
      });
    });

    beforeEach(async function () {
      await visit('/users/1');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users/1');
    });

    it('shows basic information', () => {
      expect(page.name).to.be.true;
      expect(page.email).to.be.true;
    });

    it('shows profile image', () => {
      expect(page.image).to.be.true;
    });

  });

  describe('Show phone and timezone', () => {

    beforeEach(function () {
      this.mockGet(200, '/users/1', {
        data: [{
          type: 'users',
          id: '1',
          attributes: {
            'family-name': "Fake",
            'given-name': 'User',
            email: 'fake@acme.com',
            phone: '987654123',
            timezone: 'GMT-5',
            'profile-visibility': 1
          }
        }]
      });
    });

    beforeEach(async function () {
      await visit('/users/1');
    });

    it('shows phone and timezone',() => {
      expect(page.phone).to.be.true;
      expect(page.timezone).to.be.true;
    });

  });

});