import * as React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { location, visit } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupRequestInterceptor, useFakeAuthentication, setupApplicationTest
} from 'tests/helpers';

import page from './page';

// TODO: Modify this test when we had real notifications commit from the API
describe('Acceptance notifications', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('An individual task notification can be clear from the list',() => {

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
          expect(page.isIndividualNotificationPresent).to.be.true;
        });
      });

    });
  });
});