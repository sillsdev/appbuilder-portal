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

  beforeEach(function () {
    this.mockGet(200, '/organizations', { data: [{
      type: 'organizations',
      id: 1,
      attributes: {}
    }] });
  });

  describe('navigate to tasks page',() => {
    beforeEach(async () => {
      await visit('/tasks');

      expect(location().pathname).to.eq('/tasks');
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('Open sidebar',() => {
      beforeEach(async () => {
        await page.clickOpenSidebarButton();
      });

      it('Sidebar opened',() => {
        expect(page.isSidebarVisible).to.be.true;
      });

      describe('Close open sidebar', () => {
        beforeEach(async () => {
          await page.clickCloseSidebarButton();
        });

        it('Sidebar closed',() => {
          expect(page.isSidebarVisible).to.be.false;
        });
      });

    });

  });

});
