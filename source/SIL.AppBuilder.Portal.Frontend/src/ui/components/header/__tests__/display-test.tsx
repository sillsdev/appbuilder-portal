import { describe, beforeEach, it } from '@bigtest/mocha';
import { location, visit } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupRequestInterceptor,
  useFakeAuthentication,
  setupApplicationTest,
} from 'tests/helpers';
import headerHelper from 'tests/helpers/components/header';


describe('Acceptance | Component | Header', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function() {
    this.mockGet(200, '/organizations', {
      data: [
        {
          type: 'organizations',
          id: 1,
          attributes: {},
        },
      ],
    });
  });

  describe('Dropdowns', () => {
    beforeEach(async () => {
      await visit('/');
    });

    describe('the notifications dropdown', () => {
      beforeEach(async () => {
        expect(headerHelper.isNotificationMenuOpen).to.be.false;

        await headerHelper.clickNotification();
      });

      it('is open', () => {
        expect(headerHelper.isNotificationMenuOpen).to.be.true;
      });
    });

    describe('the user/avarar dropdown', () => {
      beforeEach(async () => {
        expect(headerHelper.isAvatarMenuOpen).to.be.false;

        await headerHelper.clickAvatar();
      });

      it('is open', () => {
        expect(headerHelper.isAvatarMenuOpen).to.be.true;
      });
    });
  });

  describe('Go to profile', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: {
          type: 'users',
          id: '1',
          attributes: {
            givenName: 'hi',
          },
        },
      });
    });

    beforeEach(async () => {
      await visit('/');
      await headerHelper.clickProfileLink();
    });

    it('redirect to profile', () => {
      expect(location().pathname).to.eq('/users/1/edit');
    });
  });
});
