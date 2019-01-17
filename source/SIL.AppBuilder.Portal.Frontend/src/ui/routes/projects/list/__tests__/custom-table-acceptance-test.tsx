import { when } from '@bigtest/convergence';
import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { expect } from 'chai';
import {
  setupApplicationTest,
  setupRequestInterceptor,
  useFakeAuthentication,
} from 'tests/helpers/index';

import PageInteractor from './-page-interactor';
import * as ProjectsFactory from './-factory';

describe('Acceptance | My Projects | Column selector', () => {
  let pageInteractor;
  setupApplicationTest();
  setupRequestInterceptor();
  useFakeAuthentication();

  beforeEach(function() {
    this.mockGet(200, 'product-definitions', { data: [] });
    this.mockGet(200, 'projects', { ...ProjectsFactory.projectsResponse });
  });

  describe('navigates to my project page', () => {
    beforeEach(async function() {
      pageInteractor = new PageInteractor();
      await visit('/projects/own');
      await when(() => pageInteractor.isPresent);
    });

    it('is in directory page', () => {
      expect(location().pathname).to.equal('/projects/own');
    });

    describe('Default columns are selected', () => {
      beforeEach(async function() {
        await pageInteractor.projectTable.clickColumnSelector();
      });

      it('default options are selected', () => {
        const items = pageInteractor.projectTable.selectedItems();
        const itemsText = items.map((i) => i.text);

        expect(itemsText).to.contain('Owner');
        expect(itemsText).to.contain('Group');
        expect(itemsText).to.contain('Build Version');

        expect(itemsText).to.not.contain('Updated On');
        expect(itemsText).to.not.contain('Organization');
        expect(itemsText).to.not.contain('Language');
        expect(itemsText).to.not.contain('Build Date');
        expect(itemsText).to.not.contain('Created On');
      });
    });
  });
});
