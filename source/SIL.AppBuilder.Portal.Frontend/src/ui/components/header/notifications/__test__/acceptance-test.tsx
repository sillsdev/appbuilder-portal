import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { location, visit } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupRequestInterceptor, useFakeAuthentication, setupApplicationTest
} from 'tests/helpers';

import page from './page';

// TODO: Modify this test when we had real notifications commit from the API
// TODO: Use real fake data
describe('Acceptance | Notifications', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('An individual task notification can be clear from the list', () => {

    describe('Open Notification dropdown', () => {

      beforeEach(async () => {
        await visit('/');
        await page.clickNotification();
      });

      it('is open',() => {
        expect(page.isNotificationMenuOpen).to.be.true;
      });

      describe('Close individual notification',() => {

        beforeEach(async () => {
          await page.clickCloseIndividualNotification();
        });

        // TODO: Intercept PATCH request when API is available
        it('notification is gone',() => {
          expect(page.hasNotifications).to.be.true;
        });
      });
    });

    describe('Clears a single notification', () => {
      beforeEach(async () => {
        const numNotifications = page.countNotifications();
        
        expect(numNotifications).to.eq(2)

        await page.clickCloseIndividualNotification();
      });

      it('there is one fewer notification', () => {
        const numNotifications = page.countNotifications();

        expect(numNotifications).to.eq(1);
      });
    });

    describe('Clears all notifications', () => {
      beforeEach(async () => {
        const numNotifications = page.countNotifications();
        
        expect(numNotifications).to.eq(2)

        await page.clickClearAll();
      });

      it('has no more notifications listed', () => {
        const numNotifications = page.countNotifications();

        expect(numNotifications).to.eq(0);
      });
    });
  });
});