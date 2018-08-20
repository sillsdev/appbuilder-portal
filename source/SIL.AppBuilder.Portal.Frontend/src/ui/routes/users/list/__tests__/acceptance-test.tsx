import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './page';

describe('Acceptance | Disable User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {

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

      this.mockGet(200,'/groups', {
        data: [{
          type: 'groups',
          id: '2',
          attributes: {
            name: 'Fake group'
          }
        }]
      });
    });

    beforeEach(async function () {
      await visit('/users');
    });

    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    describe('an active users exists', () => {

      it('active user', () => {
        console.log(page.unlockUser);
        expect(page.unlockUser).to.equal(true);
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

        describe('toggle is clicked', () => {
          beforeEach(async () => {
            await page.clickLockUser();
          });

          it("user locked", () => {
            console.log(page.unlockUser);
            expect(page.unlockUser).to.equal(false);
          });
        });
      });
    });
  });

});
