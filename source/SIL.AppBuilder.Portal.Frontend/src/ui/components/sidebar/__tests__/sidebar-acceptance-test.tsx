import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  useFakeAuthentication,
  setupRequestInterceptor,
} from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Sidebar', () => {
  useFakeAuthentication();
  setupApplicationTest();

  describe('navigate to tasks page', () => {
    beforeEach(async () => {
      await visit('/tasks');

      expect(location().pathname).to.eq('/tasks');
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('Close button', () => {
      it('is no longer visible', () => {
        expect(page.isCloseButtonVisible).to.be.true;
      });

      it('is only visible in responsive view', () => {
        expect(page.isCloseButtonVisibleInResponsive).to.be.true;
      });
    });
  });

  describe('data shown in the sidebar', () => {
    describe('there are no tasks', () => {
      beforeEach(async function() {
        this.mockGet(200, '/user-tasks', {
          data: [],
        });
  
        await visit('/tasks');
      });

      it('does not show a counter next to the tasks navigation', () => {

      });
    });

    describe('there are tasks for the current user', () => {
      beforeEach(async function() {
        this.mockGet(200, '/user-tasks', {
          data: [],
        });
  
        await visit('/tasks');
      });

      it('shows a counter next to the tasks navigation', () => {

      });
    });
  });
});
