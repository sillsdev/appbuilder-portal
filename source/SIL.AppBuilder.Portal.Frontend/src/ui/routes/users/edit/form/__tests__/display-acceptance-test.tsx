import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import * as enUS from '@translations/locales/en-us.json';
import page from './page';

describe('Acceptance | Edit Profile Form', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('a user exists', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', { data: {
        type: 'users',
        id: '1',
        attributes: {
          givenName: 'hi'
        }
      } });
    });

    describe('the edit form is visited', () => {
      beforeEach(async () => {
        await visit('/users/1/edit');
      });

      it('successfully navigates', () => {
        expect(location().pathname).to.equal('/users/1/edit');
      });

      describe('The form has values', () => {
        beforeEach(async () => {
          await page.fillFirstName('Fake');
          await page.fillLastName('Name');
          await page.fillEmail('fake@domain.com');
          await page.fillPhone('997528963');
          await page.fillPublishingKey('ssh-rsa 1234');
          await page.clickEmailNotification();
          await page.clickProfileVisibility();
        });

        it('has values', () => {
          expect(page.firstname).to.equal('Fake');
          expect(page.lastname).to.equal('Name');
          expect(page.email).to.equal('fake@domain.com');
          expect(page.phone).to.equal('997528963');
          expect(page.publishingKeyText).to.equal('ssh-rsa 1234');
          expect(page.isEmailNotificationChecked).to.be.true;
          expect(page.profileVisibility).to.be.true;
        });
      });
    });

    describe('Profile visibility', () => {
      beforeEach(async () => {
        await visit('/users/1/edit');
        await page.clickProfileVisibility();
      });

      it('change its text when clicked', () => {
        expect(page.profileVisibilityText, enUS.profile.visibility.visible);
      });

      describe('change it back', () => {
        beforeEach(async () => {
          await page.clickProfileVisibility();
        });

        it('changes', () => {
          expect(page.profileVisibilityText, enUS.profile.visibility.restricted);
        });
      });
    });

  });

  describe('the email notification value from the backend is represented via the checkbox', () => {

    describe('when the value from the backend is true', () => {
      beforeEach(function () {
        this.mockGet(200, '/users/1', {
          data: {
            type: 'users',
            id: '1',
            attributes: {
              emailNotification: true
            }
          }
        });
      });

      beforeEach(async () => {
        await visit('/users/1/edit');
      });

      it('it is checked', () => {
        expect(page.isEmailNotificationChecked).to.be.true;
      });
    });

    describe('when the value from the backend is false', () => {
      beforeEach(function () {
        this.mockGet(200, '/users/1', {
          data: {
            type: 'users',
            id: '1',
            attributes: {
              emailNotification: false
            }
          }
        });
      });

      beforeEach(async () => {
        await visit('/users/1/edit');
      });

      it('it is not checked', () => {
        expect(page.isEmailNotificationChecked).to.be.false;
      });
    });
  });
});
