import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe.only('Acceptance | Disable User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {
    beforeEach(async function () {
      await visit('/users');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });
  });

  describe('an active users exists', () => {
    beforeEach(function () {
      this.mockGet(200, '/users', {
        data: [{
          type: 'users',
          id: '1',
          attributes: {
            name: "Fake user",
            'is-locked': false
          }
        }]
      });

      this.mockGet(200, '/organizations', () => {
        data: [{
          id: "1",
          type: 'organizations',
          attributes: {
            name: 'SIL International'
          }
        }]
      });
    });

    describe('locking user', () => {
      beforeEach(function () {
        this.mockPatch(200, 'users/1', {
          data: {
            type: 'users',
            id: '1',
            attributes: {
              'is-locked': true
            },
          }
        });
      });

      describe('the disable user toggle is clicked', () => {
        beforeEach(async () => {
          await page.clickLockUser();
        });

        it("changes the button text", () => {
          expect(page.unlockUser).to.equal(false);
        });
      });
    });
  });

});
