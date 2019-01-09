import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import i18n from '@ui/../translations';

import {
  setupApplicationTest, setupRequestInterceptor, useFakeAuthentication,
  respondWithJsonApi
} from 'tests/helpers';

import app from 'tests/helpers/pages/app';


describe('Acceptance | i18n', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, '/organizations', { data: [{
      type: 'organizations',
      id: 1,
      attributes: {}
    }] });
  });

  describe('the locale is changed', () => {
    beforeEach(async () => {
      await visit('/');
    });

    afterEach(() => {
      i18n.changeLanguage('en-US');
    });

    describe('to english', () => {
      beforeEach(async () => {
        await app.selectLocale('en-US');
      });

      // xit('loads the english translations', () => {
      //   expect(app.myProfileText).to.equal('My Profile');
      // });
    });

    describe('to spanish', () => {
      beforeEach(async () => {
        await app.selectLocale('es-PE');
      });

      // xit('loads the spanish translations', () => {
      //   expect(app.myProfileText).to.equal('Mi perfil');
      // });
    });
  });

});
