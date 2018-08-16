import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';

import enUS from '@ui/../translations/locales/en-us';
import page from './page';

describe('Acceptance | Edit Profile Form', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(async function () {
    this.mockGet(200, '/organizations', { data: [{
      type: 'organizations',
      id: 1,
      attributes: {}
    }] });


    this.mockGet(200, '/users/1', { data: {
      type: 'users',
      id: '1',
      attributes: {
        givenName: 'hi'
      }
    } });


    await visit('/users/1/edit');

    expect(location().pathname).to.equal('/users/1/edit');
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillFirstName('Fake');
      await page.fillLastName('Name');
      await page.fillEmail('fake@domain.com');
      await page.fillPhone('997528963');
      await page.clickEmailNotification();
      await page.clickProfileVisibility();
      await page.fillSSHKey('abcd');
    });

    it('has values', () => {
      expect(page.firstname).to.equal('Fake');
      expect(page.lastname).to.equal('Name');
      expect(page.email).to.equal('fake@domain.com');
      expect(page.phone).to.equal('997528963');
      expect(page.emailNotification).to.be.true;
      expect(page.profileVisibility).to.be.true;
      expect(page.sshKey).to.equal('abcd');

    });
  });

  describe('Profile visibility', () => {
    beforeEach(async () => {
      await page.clickProfileVisibility();
    });

    it('change its text when clicked', () => {
      expect(page.profileVisibilityText, enUS.profile.visibility.visible);
    });

    describe('change it back',() => {
      beforeEach(async () => {
        await page.clickProfileVisibility();
      });

      it('changes', () => {
        expect(page.profileVisibilityText, enUS.profile.visibility.restricted);
      })
    })
  });
});
