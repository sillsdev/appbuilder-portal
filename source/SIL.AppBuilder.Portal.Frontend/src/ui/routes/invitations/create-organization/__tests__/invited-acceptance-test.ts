import { describe } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import { setupApplicationTest } from 'tests/helpers/index';

import page from '../form/__tests__/page';

describe('Acceptance | Invitations | Create Organization', () => {
  setupApplicationTest();

  describe('navigates to an org invitation', () => {
    beforeEach(async () => {
      await visit('/invitations/organization/something');

      expect(location().pathname).to.eq('/invitations/organization/something');
    });

    describe('the form data is filled in', () => {
      beforeEach(async () => {
        await page.fillWebsite('fake.fake');
        await page.fillOrgName('Acme Org');
      });

      describe('the form is submitted', () => {
        beforeEach(async () => {
          await page.clickSubmit();
        });

        it('is redirected', () => {
          expect(location().pathname).to.eq('/');
        });
      });
    });
  });
});
