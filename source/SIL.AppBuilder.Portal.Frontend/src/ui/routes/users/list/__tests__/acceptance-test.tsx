import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';

import UserTableInteractor from './-user-table';

let userTable = null;
describe('Acceptance | Disable User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigates to users page', () => {
    beforeEach(async function() {
      this.mockGet(200, '/users', {
        data: [
          {
            type: 'users',
            id: '1',
            attributes: {
              name: 'Fake user',
              'is-locked': false,
            },
          },
        ],
      });

      this.mockGet(200, '/groups', {
        data: [
          {
            type: 'groups',
            id: '2',
            attributes: {
              name: 'Fake group',
            },
          },
        ],
      });

      await visit('/users');
      userTable = new UserTableInteractor();

      await when(() => userTable.row().length > 0);
    });

    it('is on the users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    describe('an active user exists', () => {
      it('active user', () => {
        expect(userTable.isUserActive).to.equal(true);
      });

      describe('locking user', () => {
        beforeEach(function() {
          this.mockPatch(200, 'users/1', {
            data: {
              type: 'users',
              id: '1',
              attributes: {
                'is-locked': true,
              },
            },
          });
        });

        describe('toggle is clicked', () => {
          beforeEach(async () => {
            await userTable.clickLockUser();
            await when(() => userTable.isUserActive === false);
          });

          it('user becomes locked', () => {
            expect(userTable.isUserActive).to.equal(false);
          }).timeout(2000);
        });
      });
    });
  });
});
