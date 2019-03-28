import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';
import * as enUS from '@translations/locales/en-us.json';

import page from './page';

describe('Acceptance | Edit Profile Form', () => {
  useFakeAuthentication();
  setupApplicationTest();

  describe('a user exists', () => {
    beforeEach(function() {
      this.mockGet(200, '/users/1', {
        data: {
          type: 'users',
          id: '1',
          attributes: {
            givenName: 'first',
            familyName: 'last',
            email: 'whatever@w.ver',
            phone: 'no',
            profileVisibility: false,
            emailNotification: false,
          },
        },
      });
    });

    describe('the edit form is visited', () => {
      beforeEach(async () => {
        await visit('/users/1/edit');
      });

      it('successfully navigates', () => {
        expect(location().pathname).to.equal('/users/1/edit');
      });

      it('renders the firstname', () => expect(page.firstname).to.equal('first'));
      it('renders lastname', () => expect(page.lastname).to.equal('last'));
      it('renders email', () => expect(page.email).to.equal('whatever@w.ver'));
      it('renders phone number', () => expect(page.phone).to.equal('no'));
      it('renders email notification', () => expect(page.isEmailNotificationChecked).to.be.false);
      it('renders profile visibility', () => expect(page.profileVisibility).to.be.false);

      describe('The form has values', () => {
        beforeEach(async () => {
          await page.fillFirstName('Fake');
          await page.fillLastName('Name');
          await page.fillEmail('fake@domain.com');
          await page.fillPhone('997528963');
          await page.clickEmailNotification();
          await page.clickProfileVisibility();
        });

        it('updates the firstname', () => expect(page.firstname).to.equal('Fake'));
        it('updates lastname', () => expect(page.lastname).to.equal('Name'));
        it('updates email', () => expect(page.email).to.equal('fake@domain.com'));
        it('updates phone number', () => expect(page.phone).to.equal('997528963'));
        it('updates email notification', () => expect(page.isEmailNotificationChecked).to.be.true);
        it('updates profile visibility', () => expect(page.profileVisibility).to.be.true);
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
      beforeEach(function() {
        this.mockGet(200, '/users/1', {
          data: {
            type: 'users',
            id: '1',
            attributes: {
              emailNotification: true,
            },
          },
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
      beforeEach(function() {
        this.mockGet(200, '/users/1', {
          data: {
            type: 'users',
            id: '1',
            attributes: {
              emailNotification: false,
            },
          },
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
