import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
  useFakeAuthentication,
} from 'tests/helpers';

import UserTableInteractor from './-user-table';

let userTable = null;
describe('Acceptance | Disable User', () => {
  useFakeAuthentication();
  setupApplicationTest();

  describe('navigates to users page', () => {
    beforeEach(async function() {
      this.mockGet(200, '/users', {
        data: [
          {
            type: 'users',
            id: '2',
            attributes: {
              name: 'Fake user',
              'is-locked': false,
            },
          },
        ],
        included: [
          {
            id: 2,
            type: 'organization-memberships',
            attributes: {},
            relationships: {
              user: { data: { id: 2, type: 'users' } },
              organization: { data: { id: 1, type: 'organizations' } },
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
      userTable = new UserTableInteractor(UserTableInteractor.defaultScope);

      await when(() => userTable.row().length > 0);
    });

    it('is on the users page', () => {
      expect(location().pathname).to.equal('/users');
    });

    describe('an active user exists', () => {
      it('active user', () => {
        expect(userTable.row(0).isActive).to.equal(true);
      });

      describe('locking user', () => {
        beforeEach(function() {
          this.mockPatch(200, 'users/2', {
            data: {
              type: 'users',
              id: '2',
              attributes: {
                'is-locked': true,
              },
            },
          });
        });

        describe('toggle is clicked', () => {
          beforeEach(async () => {
            expect(userTable.row(0).isActive).to.equal(true);

            await userTable.row(0).toggleActive();
          });

          it('user becomes locked', () => {
            expect(userTable.row(0).isActive).to.equal(false);
          });
        });
      });
    });
  });
});
