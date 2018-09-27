import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';

import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication
} from 'tests/helpers/index';

import page from '@ui/components/project-table/__tests__/page';

describe('Acceptance | Project Table | Column selector', () => {
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function () {
    this.mockGet(200, 'projects', {
      data: [],
      meta: { 'total-records': 0 }
    });
  });

  describe('navigates to my project page', () => {
    beforeEach(async function () {
      await visit('/projects/own');
    });

    it('is in my own projects page', () => {
      expect(location().pathname).to.equal('/projects/own');
    });

    it('is project list empty', () => {
      expect(page.isEmptyTextPresent).to.be.true;
      expect(page.emptyText).to.equal('No projects found');
    });
  });

});