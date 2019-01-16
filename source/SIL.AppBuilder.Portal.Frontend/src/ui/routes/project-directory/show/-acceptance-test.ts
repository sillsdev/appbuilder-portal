import { describe, beforeEach, it } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers';

import page from './-page';
import * as scenarios from './-scenarios';

describe('Acceptance | Project Directory | Public View', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  describe('the user visits the public project page', () => {
    const url = '/directory/1';

    beforeEach(function() {
      this.mockGet(200, '/projects/1', scenarios.projectOne);
    });

    beforeEach(async () => {
      await visit(url);
    });

    it.always('is not redirected', () => {
      expect(location().pathname).to.eq(url);
    });

    it('shows the required information', () => {
      expect(page.organizationName).to.contain('DeveloperTown');
      expect(page.orgOwnerName).to.contain('Preston Sego (org owner)');
      expect(page.ownerName).to.contain('Preston Sego (dt)');
      expect(page.description).to.contain('');

      expect(page.image.exists).to.equal(true);
      expect(page.products.artifacts.amount).to.contain('1 Artifacts');
    });
  });
});
