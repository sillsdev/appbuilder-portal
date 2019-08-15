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

describe('Acceptance | Project Table | Active list', () => {
  let pageInteractor;
  useFakeAuthentication();
  setupApplicationTest();

  describe('Render active projects list page', () => {
    beforeEach(function() {
      this.mockGet(200, 'product-definitions', { data: [] });
      this.mockGet(200, 'projects', { ...ProjectsFactory.projectsResponse });
    });

    describe('navigates to active projects page', () => {
      beforeEach(async function() {
        pageInteractor = new PageInteractor();
        await visit('/projects/active');
        await when(() => pageInteractor.isPresent);
      });

      it('is in active projects page', () => {
        expect(location().pathname).to.equal('/projects/active');
      });

      it('empty text is not displayed when project list exist', () => {
        expect(pageInteractor.projectTable.isEmptyTextPresent).to.be.false;
      });

      it('is sorted down by date-active', () => {
        expect(pageInteractor.projectTable.isSortingDown).to.be.true;
        expect(pageInteractor.projectTable.sortColumn).to.contain('Active Since');
      });

      it('default options are selected', () => {
        const items = pageInteractor.projectTable.selectedItems();
        const itemsText = items.map((i) => i.text);

        expect(itemsText).to.contain('Owner');
        expect(itemsText).to.contain('Group');
        expect(itemsText).to.contain('Build Version');
        expect(itemsText).to.contain('Build Date');
        expect(itemsText).to.contain('Active Since');

        expect(itemsText).to.not.contain('Updated On');
        expect(itemsText).to.not.contain('Organization');
        expect(itemsText).to.not.contain('Language');
        expect(itemsText).to.not.contain('Created On');
      });
    });
  });
});
