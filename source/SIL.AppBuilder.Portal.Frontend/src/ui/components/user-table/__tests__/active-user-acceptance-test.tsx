import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe.only('Acceptance | Disable User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('users exists', () => {

    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: '1',
          attributes: {
            givenName: 'hi',
            isLocked: 0
          }
        }, {
          type: 'users',
          id: '2',
          attributes: {
            givenName: '2 hi',
            isLocked: 0
          }
        }]
      });
    });

    describe('visit users page', () => {

      beforeEach(async () => {
        await visit('/users');
      });

      it('successfully navigates', () => {
        expect(location().pathname).to.equal('/users');
      });

      it('user is in active state', () => {
        expect(page.lockUser).to.be.true;
      });

      describe('Lock user',() => {

        beforeEach(async () => {
          await page.clickLockUser();
        });

        it('User is locked',() => {

        });
      })

    });
  });

});
