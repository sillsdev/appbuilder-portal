import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest, setupRequestInterceptor, useFakeAuthentication } from 'tests/helpers';
import i18n from '@ui/../translations';

import Form from '../index';
import page from './page';

describe('Acceptance | Edit Profile Form', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(async () => {
    await visit('/users/1/edit');

    expect(location().pathName).to.equal('/users/1/edit');
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillFirstName('Fake');
      await page.fillLastName('Name');
      await page.fillEmail('fake@domain.com');
      await page.fillPhone('997528963');
      await page.clickEmailNotification();
      await page.fillSSHKey('abcd');
    });

    it('has values', () => {
      expect(page.firstname).to.equal('Fake');
      expect(page.lastname).to.equal('Name');
      expect(page.email).to.equal('fake@domain.com');
      expect(page.phone).to.equal('997528963');
      expect(page.emailNotification).to.be.false;
      expect(page.sshKey).to.equal('abcd');

    });
  });

  describe ('the locale is changed', () => {
    afterEach(() => {
      i18n.default.changeLanguage('en-US');
    });

    describe('to english', () => {
      beforeEach(async () => {
        await page.selectLocale('en-US');
      });

      it('loads the english translations', () => {
        expect(page.localeLabel).to.equal('Locale');
      });
    });

    describe('to spanish', () => {
      beforeEach(async () => {
        await page.selectLocale('es-PE');
      });

      it('loads the spanish translations', () => {
        expect(page.localeLabel).to.equal('Idioma');
      });
    });
  });
});
