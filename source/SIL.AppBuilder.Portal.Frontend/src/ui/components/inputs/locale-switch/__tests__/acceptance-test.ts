import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  useFakeAuthentication,
  setupRequestInterceptor,
  visitTheHomePage,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Locale Select', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('user is on a page that shows the selector', () => {
    beforeEach(async function() {
      await visitTheHomePage();
    });

    it('sets the default to english', () => {
      expect(page.selected).to.eq('en');
    });

    describe('The language is changed', () => {
      describe('to spanish', () => {
        beforeEach(async () => {
          await page.chooseLanguage('es');
        });

        it('is set to spanish', () => {
          expect(page.selected).to.eq('es');
        });
      });
    });
  });
});
