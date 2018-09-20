import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest, useFakeAuthentication,
  setupRequestInterceptor
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Sidebar', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('navigate to tasks page',() => {
    beforeEach(async () => {
      await visit('/tasks');

      expect(location().pathname).to.eq('/tasks');
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('Close button',() => {

      it('is no longer visible',() => {
        expect(page.isCloseButtonVisible).to.be.true;
      });

      it('is only visible in responsive view',() => {
        expect(page.isCloseButtonVisibleInResponsive).to.be.true;
      });
    });
  });
});
