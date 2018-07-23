import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  useFakeAuthentication, setupApplicationTest, setupRequestInterceptor,
  respondWithJsonApi
} from 'tests/helpers/index';

import page from '../form/__tests__/page';

describe('Acceptance | Invitations | Create Organization', () => {
  setupApplicationTest();

  describe('navigates to an org invitation', () => {
    setupRequestInterceptor();
    useFakeAuthentication();

    beforeEach(async function() {
      const { server } = this.polly;

      server.post('/api/organizations').intercept(respondWithJsonApi(201, {
        data: {
          id: 1,
          type: 'organizations',
          attributes: {
            name: 'Acme Org'
          }
        }
      }));

      await visit('/invitations/organization/something');

      expect(location().pathname).to.eq('/invitations/organization/something');
    });

    describe('the form data is filled in', () => {
      beforeEach(async function() {
        await page.fillWebsite('fake.fake');
        await page.fillOrgName('Acme Org');
      });

      describe('the form is submitted', () => {
        beforeEach(async function() {

          await page.clickSubmit();
        });

        it('is redirected', () => {
          // waiting on some help from https://github.com/Netflix/pollyjs/issues/72
          // NOTE: it doesn't appear we can stub multiple things in a single
          //       polly instance.... BUT, their tests demonstrate it's possible...
          expect(location().pathname).to.eq('/');
        });
      });
    });
  });
});
