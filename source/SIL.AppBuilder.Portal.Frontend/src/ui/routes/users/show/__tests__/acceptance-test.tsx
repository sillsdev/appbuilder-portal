import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';

import page from './page';

const gravatarURLRegex = /https:\/\/www\.gravatar\.com\/avatar\/[a-f0-9]{32}\?s=130&d=identicon/g;

describe('Acceptance | Show User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'family-name': 'Fake',
              'given-name': 'User',
              email: 'fake@acme.com',
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/users/1');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users/1');
    });

    it('shows basic information', () => {
      expect(page.isNamePresent).to.be.true;
      expect(page.isEmailPresent).to.be.false;
    });

    describe('Profile image is present and has a valid gravatar URL', () => {
      it('Profile image is present', () => {
        expect(page.isImagePresent).to.be.true;
      });

      it('Image src is a valid gravatar URL', () => {
        expect(gravatarURLRegex.test(page.imageSrc)).to.be.true;
      });
    });
  });

  describe('User without email', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'family-name': 'Fake',
              'given-name': 'User',
              email: '',
              phone: '987654123',
              timezone: 'GMT-5',
              'profile-visibility': 1,
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/users/1');
    });

    it('Profile image still generates a valid gravatar URL', () => {
      expect(gravatarURLRegex.test(page.imageSrc)).to.be.true;
    });
  });

  describe('When profile visibility is on, show phone and timezone', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'family-name': 'Fake',
              'given-name': 'User',
              email: 'fake@acme.com',
              phone: '987654123',
              timezone: 'GMT-5',
              'profile-visibility': 1,
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/users/1');
    });

    it('shows phone and timezone', () => {
      expect(page.isphonePresent).to.be.true;
      expect(page.isTimezonePresent).to.be.true;
    });
  });

  describe('When profile visibility is off, phone and timezone are hidden', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              'family-name': 'Fake',
              'given-name': 'User',
              email: 'fake@acme.com',
              phone: '987654123',
              timezone: 'GMT-5',
              'profile-visibility': 0,
            },
          },
        ],
      });
    });

    beforeEach(async function() {
      await visit('/users/1');
    });

    it('shows phone and timezone', () => {
      expect(page.isphonePresent).to.be.false;
      expect(page.isTimezonePresent).to.be.false;
    });
  });
});
