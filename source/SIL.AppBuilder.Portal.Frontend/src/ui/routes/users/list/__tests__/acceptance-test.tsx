import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import UserTableInteractor from './-user-table';

let userTable = null;
describe('Acceptance | Disable User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {

    beforeEach(async function() {
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

      await visit('/users');
      userTable = new UserTableInteractor();
    });


    it('is in users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    describe('an active users exists', () => {

      it('active user', () => {
        expect(userTable.isUserActive).to.equal(true);
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
            await userTable.clickLockUser();
          });

          it("user locked", () => {
            expect(userTable.isUserActive).to.equal(false);
          });
        });
      });
    });
  });

});
