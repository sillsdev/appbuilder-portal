import * as React from 'react';
import * as sinon from 'sinon';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { mountWithContext } from 'tests/helpers';
import i18n from '@ui/../translations';

import Form from '../index';
import page from './page';

describe('Integration | Component | Edit Profile Form', () => {

  let fakeSubmit;

  beforeEach(async () => {

    fakeSubmit = sinon.spy();

    await mountWithContext(() => (
      <Form onSubmit={fakeSubmit} />
    ));
  });

  describe('The form has values', () => {
    beforeEach(async () => {
      await page.fillFirstName('Fake');
      await page.fillLastName('Name');
      await page.fillEmail('fake@domain.com');
      await page.fillPhone('997528963');
      await page.fillLocalization('Lima');
      await page.clickEmailNotification();
      await page.fillSSHKey('abcd');
    });

    it('has values', () => {
      expect(page.firstname).to.equal('Fake');
      expect(page.lastname).to.equal('Name');
      expect(page.email).to.equal('fake@domain.com');
      expect(page.phone).to.equal('997528963');
      expect(page.localization).to.equal('Lima');
      expect(page.emailNotification).to.be.true;
      expect(page.sshKey).to.equal('abcd');

    });

    describe('the form is submitted', () => {
      beforeEach(async () => {
        await page.clickSubmit();
      });

      it('submits the data', () => {
        expect(fakeSubmit).to.have.been.calledWithMatch({
          firstName: 'Fake',
          lastName: 'Name',
          email: 'fake@domain.com',
          phone: '997528963',
          localization: 'Lima',
          emailNotification: true,
          sshKey: 'abcd'
        });
      });
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
