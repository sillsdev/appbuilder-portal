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
setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, '/organizations', { data: [{
      type: 'organizations',
      id: 1,
      attributes: {}
    }] });
  });

  describe('navigates to an org invitation', () => {

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
          expect(location().pathname).to.eq('/');
        });
      });
    });
  });
});
