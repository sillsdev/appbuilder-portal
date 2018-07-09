import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { useFakeAuthentication, setupApplicationTest } from 'tests/helpers/index';

import page from '../form/__tests__/page';

describe('Acceptance | Users | Edit Profile', () => {

  setupApplicationTest();
  useFakeAuthentication();

  describe('navigates to my profile', () => {
    beforeEach(async () => {
      await visit('/invitations/organization/something');

      expect(location().pathname).to.eq('/invitations/organization/something');
    });

    describe('the form data is filled in', () => {
      beforeEach(async () => {
        await page.fillName('Fake name');
        await page.fillEmail('fake@domain.com');
        await page.fillLocalization('Lima');
        await page.clickEmailNotification();
        await page.fillSSHKey('abcd');
      });

      describe('the form is submitted', () => {
        beforeEach(async () => {
          await page.clickSubmit();
        });
      });
    });
  });
});
