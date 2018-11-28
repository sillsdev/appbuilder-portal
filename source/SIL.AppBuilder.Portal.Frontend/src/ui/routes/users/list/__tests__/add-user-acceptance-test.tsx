import { describe, beforeEach, it } from '@bigtest/mocha';
import { when } from '@bigtest/convergence';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import page from './-page';

describe('Acceptance | User list | Add User', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();
  let usersData;
  let user;
  describe('from users page', () => {
    beforeEach(async function() {
      user = {
        type: 'users',
        id: '1',
        attributes: {
          name: "Fake user",
          email: 'el-fake-o@fake.com',
          'is-locked': false
        }
      };
      usersData = {
        data: [user]
      };
      this.mockGet(200, '/users', usersData);

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
      await when(() => page.isVisible );
      await when(() => page.userTable.isVisible );
    });

    describe('clicking add user', () => {
      beforeEach(async () => {
        await page.addUser();
      });
      it('opens modal', () => {
        expect(page.addUserModal.isVisible).to.be.true;
      });

      describe("add a user", () => {
        beforeEach( async () => {
          await when(() => page.addUserModal.isVisible);
        });

        describe("when user exists in system", () => {
          const existingEmail = "existing@foo.com";
          beforeEach( async function() {
            const newUsersData = {...usersData};
            const newUser = {...user};
            newUser.id = '2';
            newUser.attributes = {
              name: "John Doe",
              email: existingEmail,
              'is-locked': false
            };

            newUsersData.data = [...newUsersData.data];
            newUsersData.data.push(newUser);
            this.mockGet(200, '/users', newUsersData);
            this.mockPost(201, "/organization-memberships", {
              data:{
                type: "organization-memberships",
                id: 42,
                attributes: {}
              }
            });

            await page.addUserModal.enterEmail(existingEmail);
            await page.addUserModal.submit();
          });

          it("closes modal", () => {
            expect(page.addUserModal.isPresent).to.be.false;
          });
          it("user is displayed in users table", () => {
            expect(page.userTable.containsUserByEmail(existingEmail)).to.be.true;
          });
        });

        describe("when user does not exists in system", () => {
          const existingEmail = "missing@foo.com";
          beforeEach( async function() {

            this.mockPost(422, '/organization-memberships');
            await page.addUserModal.enterEmail(existingEmail);
            await page.addUserModal.submit();
          });

          it("shows error", () => {
            expect(page.addUserModal.hasError("No user was found")).to.be.true;
          });
        });
      });
    });
  });

});
