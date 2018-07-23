import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  useFakeAuthentication, setupApplicationTest, setupRequestInterceptor
} from 'tests/helpers/index';

import page from '../form/__tests__/page';

describe('Acceptance | Invitations | Create Organization', () => {
  setupApplicationTest();

  describe('navigates to an org invitation', () => {
    setupRequestInterceptor();
    useFakeAuthentication();

    beforeEach(async function() {
      await visit('/invitations/organization/something');

      expect(location().pathname).to.eq('/invitations/organization/something');
    });

    describe('the form data is filled in', () => {
      beforeEach(async function() {
        await page.fillWebsite('fake.fake');
        await page.fillOrgName('Acme Org');

        const { server } = this.polly;

        server.post('/api/organizations').intercept((req, res) => {
          console.log('intercepted');
        });
      });

      describe('the form is submitted', () => {
        beforeEach(async function() {
          await page.clickSubmit();
        });

        it('is redirected', () => {
          expect(location().pathname).to.eq('/');
        });
      });
    });
  });
});
