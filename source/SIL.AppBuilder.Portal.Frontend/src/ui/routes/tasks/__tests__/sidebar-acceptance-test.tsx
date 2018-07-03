import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest } from 'tests/helpers/index';

import page from './page';

describe('Acceptance | Layout | Sidebar', () => {
  
  setupApplicationTest();

  describe('navigate to tasks page',() => {

    beforeEach(async () => {
      await visit('/tasks');

      expect(location().pathname).to.eq('/tasks');
    });

    describe('Open sidebar',() => {

      beforeEach(async () => {
        await page.clickOpenSidebarButton();
      });

      it('Sidebar opened',() => {
        expect(page.isSidebarVisible).to.be.true;
      })

      describe('Close open sidebar', () => {

        beforeEach(async () => {
          await page.clickCloseSidebarButton();
        });

        it('Sidebar closed',() => {
          expect(page.isSidebarVisible).to.be.false;
        })
      })

    });

  });

  // it('Sidebar exists',() => {
  //   expect(sidebarHelper.isSidebarPresent).to.be.true;
  // });

  // describe('Sidebar close when x button is clicked',() => {
  //   beforeEach(async () => {
  //     await sidebarHelper.clickCloseButton();
  //   });

  //   it('Sidebar is close', () => {
  //     expect(sidebarHelper.isSidebarVisible).to.be.true;
  //   });
  // });



});